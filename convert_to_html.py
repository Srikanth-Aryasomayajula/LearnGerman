import os
import time

# Path to the Excel and HTML files
excel_file = "Vocabulary.xlsx"
html_file = "grammatik_table.html"

# Check if both files exist
if os.path.exists(excel_file) and os.path.exists(html_file):
    # Get the last modified times for both files
    excel_mod_time = os.path.getmtime(excel_file)
    html_mod_time = os.path.getmtime(html_file)

    # Convert timestamps to readable format
    excel_mod_time_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(excel_mod_time))
    html_mod_time_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(html_mod_time))

    # Check if the HTML file was uploaded after the Excel file
    if html_mod_time > excel_mod_time:
        print(f"Success: {html_file} was uploaded after {excel_file}.")
        print(f"Excel file modified at: {excel_mod_time_str}")
        print(f"HTML file modified at: {html_mod_time_str}")
    else:
        print(f"Warning: {html_file} is uploaded before {excel_file}.")
        print(f"Excel file modified at: {excel_mod_time_str}")
        print(f"HTML file modified at: {html_mod_time_str}")
        print("Please ensure you've run the batch file to convert the Excel file to HTML and uploaded the HTML file to the repository.")
else:
    print(f"Error: One or both of the files are missing.")
    if not os.path.exists(excel_file):
        print(f"{excel_file} is missing.")
    if not os.path.exists(html_file):
        print(f"{html_file} is missing.")
