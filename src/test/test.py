from geomdl import fitting
import json

#with open("data.json", "r") as file:
#    curves = json.load(file)

with open("flat_lens_mapping.txt", "r") as file:
    data = json.load(file)
print(data)
surface = fitting.interpolate_surface(data['data'], 30, 80, 4, 4)
print(surface)

