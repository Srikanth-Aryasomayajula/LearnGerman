import os
import requests

# GitHub repository URL (raw file URL)
file_url = "https://raw.githubusercontent.com/Srikanth-Aryasomayajula/LearnGerman/main/Vocabulary.xlsx"  # Raw file URL

# Local paths for the GitHub runner environment
download_path = "/home/runner/Vocabulary.xlsx"  # Path inside the GitHub runner environment
html_file_path = "/home/runner/grammatik_table.html"  # Save HTML file

# Step 1: Download the Excel file from GitHub (inside GitHub Actions environment)
response = requests.get(file_url)
if response.status_code == 200:
    with open(download_path, 'wb') as f:
        f.write(response.content)
    print(f"Excel file downloaded successfully to {download_path}")
else:
    print(f"Failed to download the file: {response.status_code}")
    exit(1)

# Open the downloaded Excel file, process it, and save it as HTML (you can use xlwings or any other tool)
# You can then proceed to convert the Excel to HTML and save the result

import xlwings as xw

# Open Excel file
app = xw.App(visible=False)
wb = app.books.open(download_path)

# Find the Grammatik sheet
sheet = wb.sheets['Grammatik']

# Save the sheet as HTML
sheet.api.SaveAs(html_file_path, FileFormat=44)  # 44 is the file format for HTML

# Close the workbook and app
wb.close()
app.quit()

print(f"HTML file saved to {html_file_path}")
