import xlwings as xw
import os
import re

def convert_to_utf8(file_path):
    if not os.path.exists(file_path):
        print(f" File not found: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='windows-1252') as f:
            content = f.read()
    except UnicodeDecodeError as e:
        print(f" Cannot decode {file_path} with windows-1252: {e}")
        return

    # Ensure UTF-8 meta tag
    content = re.sub(
        r'<meta[^>]+charset=[^>]+>',
        '<meta charset="UTF-8">',
        content,
        flags=re.IGNORECASE
    )

    if '<meta charset="UTF-8">' not in content:
        content = content.replace("<head>", "<head>\n<meta charset=\"UTF-8\">", 1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f" Converted to UTF-8: {file_path}")

# ------------------------- Export & Convert -------------------------
excel_file = "Vocabulary.xlsx"
html_file = "grammatik_table.html"

# Paths
current_dir = os.getcwd()
html_file_path = os.path.join(current_dir, html_file)
support_folder = os.path.join(current_dir, os.path.splitext(html_file)[0] + "-Dateien")

# Remove old file
if os.path.exists(html_file_path):
    os.remove(html_file_path)

# Export using xlwings
app = xw.App(visible=False)
wb = app.books.open(excel_file)
sheet = wb.sheets['Grammatik']

new_wb = xw.Book()
sheet.api.Copy(Before=new_wb.sheets[0].api)
new_wb.sheets[1].delete()
new_wb.api.SaveAs(html_file_path, FileFormat=44)

new_wb.close()
wb.close()
app.quit()

# Clean and convert encoding
convert_to_utf8(html_file_path)

# Remove tabstrip frame
with open(html_file_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'<frame[^>]+src=["\'].*tabstrip\.html["\'][^>]*>', '', content, flags=re.IGNORECASE)
with open(html_file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Convert all supporting .html files
if os.path.exists(support_folder):
    for root, _, files in os.walk(support_folder):
        for name in files:
            if name.endswith('.html'):
                convert_to_utf8(os.path.join(root, name))
else:
    print(" Supporting folder not found")

print(" All files saved and encoded as UTF-8.")
