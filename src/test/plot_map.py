import numpy as np
from matplotlib import pyplot as plt
import json
from geomdl import fitting

def get_min_nonan(arr):
    cur_min = 999999999
    for i in arr:
        if i == np.nan:
            continue
        if cur_min > i:
            cur_min = i

    return cur_min
def get_max_nonan(arr):
    cur_max = -999999999
    for i in arr:
        if i == np.nan:
            continue
        if cur_max < i:
            cur_max = i

    return cur_max



def get_nearest_point_to_uv(data, u, v):
    # print(data, u, v)
    # np.nan_to_num(data, copy = False, nan = 99999)
    # print(np.shape(data))
    # return np.abs( data - np.array([u, v])).argmin() # return index of nearest point

    cur_nearest = [0, 9999999999]    # index, distance (note to self: consider using this distance as a weight in the future when doing surface approximation)

    # inefficient manual sort through one at a time, finding distance as we go
    for i in range(len(data)):
        # skip nan values 
        if u == np.nan or v == np.nan:
            continue

        cur_dist = (data[i, 0] - u) ** 2 + (data[i, 1] - v) **2
        cur_diff = cur_dist - cur_nearest[1] # assuming both are positive
        if cur_diff < 0:    # cur_dist < cur_nearest => cur_diff is negative
            cur_nearest = [i, cur_dist]
    
    return cur_nearest


def get_dout(ptsU, ptsV):
    pts = []

    # u_const = 60
    # v_const = 10
    # tol = .3
    #num_curves_u = 30 - 1
    #num_curves_v = 80 - 1

    num_curves_u = ptsU
    num_curves_v = ptsV

    skip = 279

    with open("flat_lens_mapping.txt", "r") as file:
        

        i = -1
        for line in file:
            # if i == -1 or i % skip not in range(0, 37):
            if i == -1:
                i += 1
                continue
            cur_line = line.split()
            
            # if abs(float(cur_line[2]) - u_const) > tol:
            #    i += 1
            #    continue

            pts.append([])
            j = 0
            for num in cur_line:
                if not num == "NaN":
                    pts[-1].append(float(num))
                else:
                    pts[-1].append(np.nan)
                j+=1
            i+=1

    pts = np.array(pts)
    umin = get_min_nonan(pts[:, 2])
    umax = get_max_nonan(pts[:, 2])
    vmin = get_min_nonan(pts[:, 3])
    vmax = get_max_nonan(pts[:, 3])

    print(umin, umax, vmin, vmax)


    u_vals = np.arange(umin, umax + 0.5, (umax - umin) / num_curves_v)
    v_vals = np.arange(vmin, vmax + 0.5, (vmax - vmin) / num_curves_u)


    data = pts[:, 2:4]

    dout_ = np.zeros([len(u_vals), len(v_vals), 2])
    weights_and_indices = np.zeros([len(u_vals), len(v_vals), 2])   # [ weights, indices ]




    # for i, u in enumerate(u_vals):
        # for j, v in enumerate(v_vals):
    for j, v in enumerate(v_vals):
        for i, u in enumerate(u_vals):
            cur_nearest = get_nearest_point_to_uv(data, u, v)


            # print(cur_nearest)
            # dout[i, j, 0] = cur_pt[0]
            # dout[i, j, 1] = cur_pt[1]
            weights_and_indices[i, j] = cur_nearest
            dout_[i, j, 0] = pts[cur_nearest[0], 0]
            dout_[i, j, 1] = pts[cur_nearest[0], 1]
            # print(cur_nearest[1])

    print(dout_.shape)
    #print(dout_[20, 3])

    # dout = np.sort(dout_, 3)
    dout = np.array(dout_)
    # dout = np.array(np.rot90(np.rot90(dout_)))
    # dout = np.sort(dout, 1)
    # dout = dout_
    print(dout.shape)
    return {"data": dout, "weights_indices": weights_and_indices}

def rotate(dout):
    for i in range(len(dout)):
        for j in range(len(dout[0])):
            tmp = dout[i, j, 0]
            dout[i,j,0] = dout[i,j,1]
            dout[i,j,1] = tmp

    return dout



# Now, we need to make corrections for when nearest is quite far.
# Let's see if we can take advantage of the fact that the surface doesn't need to be within the bounds of the surface we're approximating (for our purposes, anyways).

# in this version, there will be inaccuracies towards the edges of the lens, because of these issues which will affect (significantly) the approximation of the curves.
# To fix this, *use weights that are proportional to the distance (above)* for each of the points when doing approximations.
# For now, we're just gonna run with it; we don't got the time for the aforementioned at the moment.

# Also consider utilizing derivatives at edge points to extrapolate one or two extra points in order to make the edges better
# Also consider doing more for the edges, considering the sharp change at a certain point at the top of the test lens

# Also add points a bit outside of the given parameter space (e.g. x in [-70, 70] and y in [0, 17.5]) s.t. the edges have definitions in the NURBS surface


def plot_plots(version = "scatter"):
    fig, ax = plt.subplots()
    fig2, ax2 = plt.subplots()

    if version == "line":
        for i in range(len(dout)):
            plt.plot(dout[i, :,0], dout[i, :,1])
            # ax2.line(x = dout[:, i,0], y = dout[:, i,1])
        for i in range(len(dout[0])):
            plt.plot(dout[:, i,0], dout[:, i,1])
    
    else:
        for i in range(len(dout)):
            ax.scatter(x = dout[i, :,0], y = dout[i, :,1])
        for j in range(len(dout[0])):
            ax2.scatter(x = dout[:, j,0], y = dout[:, j,1])
    
    plt.xlim(-70, 70)
    plt.ylim(0,20)

    plt.axis('equal')
    plt.show()
    print(pts)




#fig, ax = plt.subplots()
#quiv_u = ax.quiver(pts[:,0], pts[:,1], pts[:,4], pts[:,5], headwidth = 1)
#ax.quiverkey(quiv, )


#quiv_v = ax.quiver(pts[:,0], pts[:,1], pts[:,6], pts[:,7], headwidth = 1)



# function for use fitting below
def fit_func(x, a, b, c):
    return a * x ** 2 + b * x + c

# Go through and make corrections for the curves above
# def correct_curves(u, u_err):
    # Plan: get fit funcs, then for each intersection between two curves that is originally with a lot of error, find the intersection between the two curves



def save_output_json(data, save_weights = False):

    if save_weights:
        with open('flat_lens_map_weights.json', 'w') as file:
            # json.dump(out_json, file, ensure_ascii = False, indent = 2)
            json.dump({"data": data["data"].tolist(),"weights_indices": data["weights_indices"].tolist()}, file, indent = 2)
    else:
        with open('flat_lens_map.json', 'w') as file:
            # json.dump(out_json, file, ensure_ascii = False, indent = 2)
            json.dump({"data": data["data"].tolist()}, file, indent = 2)


# unfinished
def load_grin_contours(filename):
    out = []

    with open("grin_contours_raw.txt", "r") as file:
        next_contour = False
        for line in file:
            for string in line:
                match string:
                    case "BEGIN_CONTOUR":
                        next_contour = False
                    case "END_CONTOUR":
                        next_contour = True

# def gen_dout():
#     dout = get_dout()
#     with open('dout.txt', 'w') as file:
#         json.dump()

# def load_dout():
#     with open('dout.txt', 'r') as file:
#         file.load()

def gen_surf():

    # gordon_surf_out = {
    #     "u": [],
    #     "v": [],
    #     "u_err": [],
    #     "v_err": []
    # }
    # for i in range(len(dout)):
    #     # gordon_surf_out["u"].append({ "x": dout[i, :, 0], "y": dout[i, :, 1] })
    #     gordon_surf_out["u"].append([ dout[i, :, 0], dout[i, :, 1] ])
    #     gordon_surf_out["u_err"].append(weights_and_indices[i, :, 0])
    # for i in range(len(dout[0])):
    #     # gordon_surf_out["v"].append({ "x": dout[:, i, 0], "y": dout[:, i, 1] })
    #     gordon_surf_out["v"].append([ dout[:, i, 0], dout[:, i, 1] ])
    # #     gordon_surf_out["v_err"].append(weights_and_indices[:, i, 0])

    # print(gordon_surf_out["u"])
    # print(gordon_surf_out["v"])

    # with open('gordon_surf_curves_test.json', 'w') as file:
    #     gso = gordon_surf_out
    #     for i in gso.keys():
    #         gso[i] = np.ndarray(gso[i]).tolist()
    #     json.dump(gso, file)

    nu = 5
    nv = 7

    data = get_dout(nu - 1, nv - 1)
    pts = []
    dout = data['data']

    for i in range(len(dout)):
        for j in range(len(dout[i])):
            pts.append(tuple(dout[i, j].tolist()))
    
    surface = fitting.interpolate_surface(pts, nv, nu, 4, 4)
    # surface = fitting.approximate_surface(pts, 30, 30, 4, 4, ctrlpts_size_u = 5, ctrlpts_size_v = 5)

    print(surface)

    with open('interpolated_surface_test.json', 'w') as file:
        surf_params = {
            "ctrlPts": surface.ctrlpts2d,
            "degree1": 4,
            "degree2": 4,
            "knots1": surface.knotvector_u,
            "knots2": surface.knotvector_v
        }
        json.dump(surf_params, file)


    print("ctrlPts: %s" % (str(surface.ctrlpts2d)))
    print("degU, degV: %s, %s" % (str(surface.degree_u), str(surface.degree_v)))
    print("knotsU, knotsV: \n\t%s\n\t%s" % (str(surface.knotvector_u), str(surface.knotvector_v)))
    print("ctrlPtsSizes: %s, %s" % (str(surface.ctrlpts_size_u), str(surface.ctrlpts_size_v)))

    


gen_surf()



# dout = get_dout(30, 30)
# print(dout)

# save_output_json(dout, True)
# save_output_json(np.rot90(dout), True)
#plot_plots("line")
# plot_plots()






