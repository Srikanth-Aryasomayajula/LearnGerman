import xlwings as xw
import os
import git
from datetime import datetime

# Path to the local GitHub repo
repo_dir = os.getcwd()  # This assumes the script is run inside the repo directory
excel_file = os.path.join(repo_dir, "Vocabulary.xlsx")
html_file = os.path.join(repo_dir, "grammatik_table.html")

# Open Excel and the specific sheet
app = xw.App(visible=False)
wb = app.books.open(excel_file)

# Save the "Grammatik" sheet as HTML
sheet = wb.sheets["Grammatik"]
sheet.api.SaveAs(html_file, FileFormat=44)  # FileFormat=44 is for saving as HTML

# Close the workbook and Excel
wb.close()
app.quit()

# Git operations to commit and push the HTML file
repo = git.Repo(repo_dir)
repo.git.add(html_file)
repo.index.commit(f"Update HTML from Excel on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
origin = repo.remotes.origin
origin.push()

print(f"HTML file {html_file} pushed successfully!")
