import xlwings as xw
import os
import re
import shutil

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

# ------------------------- Export & Convert Multiple Sheets -------------------------

# Sheets to export (mapping of sheet name -> output filename)
sheets_to_export = {
    "Grammatik": "grammatik_table.html",
    "Vokabular": "vokabular_table.html",
    "Maschinenbau": "maschinenbau_table.html",
    "Führerschein": "fuehrerschein_table.html",
}

# Create output directory
output_dir = os.path.join(os.getcwd(), "Extracted_htmls")
os.makedirs(output_dir, exist_ok=True)

# Open workbook once
app = xw.App(visible=False)
wb = app.books.open("Vocabulary.xlsx")

for sheet_name, html_filename in sheets_to_export.items():
    print(f"\nProcessing sheet: {sheet_name}")

    # Prepare output paths inside Extracted_htmls
    html_file_path = os.path.join(output_dir, html_filename)
    support_folder = os.path.join(output_dir, os.path.splitext(html_filename)[0] + "-Dateien")

    # Delete previous HTML file if exists
    if os.path.exists(html_file_path):
        os.remove(html_file_path)

    # Delete previous support folder if exists
    if os.path.exists(support_folder):
        shutil.rmtree(support_folder)

    # Export sheet to new workbook then HTML
    new_wb = xw.Book()
    wb.sheets[sheet_name].api.Copy(Before=new_wb.sheets[0].api)
    new_wb.sheets[1].delete()
    new_wb.api.SaveAs(html_file_path, FileFormat=44)
    new_wb.close()

    # Convert encoding and cleanup
    convert_to_utf8(html_file_path)

    # Remove tabstrip frame
    with open(html_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'<frame[^>]+src=["\'].*tabstrip\.html["\'][^>]*>', '', content, flags=re.IGNORECASE)
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Convert subfiles in support folder
    if os.path.exists(support_folder):
        for root, _, files in os.walk(support_folder):
            for name in files:
                if name.endswith('.html'):
                    convert_to_utf8(os.path.join(root, name))
    else:
        print(" Supporting folder not found")

wb.close()
app.quit()

print(f"\n All selected sheets exported and saved as UTF-8 HTML inside 'Extracted_htmls' folder in {output_dir}")
