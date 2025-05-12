import xlwings as xw
import os
import git
import requests

# GitHub repository URL (raw file URL)
file_url = "https://github.com/Srikanth-Aryasomayajula/LearnGerman/raw/refs/heads/main/Vocabulary.xlsx"  # Change to your file URL

# Local paths
download_path = r"C:\Users\srika\Downloads\Vocabulary.xlsx"
html_file_path = r"C:\Users\srika\Downloads\grammatik_table.html"

# Step 1: Download the Excel file from GitHub
response = requests.get(file_url)
if response.status_code == 200:
    with open(download_path, 'wb') as f:
        f.write(response.content)
    print("Excel file downloaded successfully.")
else:
    print(f"Failed to download the file: {response.status_code}")
    exit(1)

# Step 2: Open the Excel file using xlwings
app = xw.App(visible=False)
wb = app.books.open(download_path)

# Step 3: Save the 'Grammatik' sheet as HTML
try:
    wb.sheets["Grammatik"].api.SaveAs(html_file_path, FileFormat=44)  # FileFormat=44 saves as HTML
    print(f"Excel sheet 'Grammatik' saved as HTML to {html_file_path}")
except Exception as e:
    print(f"Error while saving the sheet as HTML: {e}")
    wb.close()
    app.quit()
    exit(1)

# Step 4: Close the workbook and Excel
wb.close()
app.quit()

# Step 5: Commit and push the changes to the repo
repo_dir = os.getcwd()  # This assumes the script is run inside the repo directory
repo = git.Repo(repo_dir)
repo.git.add(html_file_path)
repo.index.commit(f"Update HTML from Excel on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
repo.git.push("origin", "main")
print("Changes pushed to the repository.")
