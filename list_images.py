import os

# The folder where your images are
folder_path = "images"

# Extensions to look for
valid_extensions = (".png", ".jpg", ".jpeg", ".webp")

try:
    # Get all files
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions)]
    
    # Generate the JavaScript code
    print("\n--- COPY THE CODE BELOW ---\n")
    print("const ringImageFiles = [")
    for filename in files:
        print(f"    'images/{filename}',")
    print("];")
    print("\n---------------------------\n")
    
except FileNotFoundError:
    print(f"Error: The folder '{folder_path}' was not found.")