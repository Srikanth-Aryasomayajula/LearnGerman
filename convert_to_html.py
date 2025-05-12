import os

# The name of the HTML file to check
html_file = "grammatik_table.html"

# Check if the HTML file exists in the current directory
html_file_exists = os.path.exists(html_file)

# Print a message based on whether the HTML file exists
if html_file_exists:
    print(f"Success: {html_file} exists in the repository.")
else:
    print(f"Warning: {html_file} is missing in the repository.")
    print("Please ensure you've run the batch file to convert the Excel file to HTML and uploaded the HTML file to the repository.")
