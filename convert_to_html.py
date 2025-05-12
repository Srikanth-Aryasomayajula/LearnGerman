import xlwings as xw
import os

# Define paths
input_file = "Vocabulary.xlsx"
output_file = "grammatik_table.html"
sheet_to_export = "Grammatik"

# Open Excel in background
app = xw.App(visible=False)
try:
    # Open workbook and get sheet
    wb = app.books.open(input_file)
    sht = wb.sheets[sheet_to_export]
    
    # Save just the selected sheet as a separate workbook
    temp_wb = xw.Book()  # Create new temporary workbook
    sht.api.Copy(Before=temp_wb.sheets[0].api)  # Copy sheet into temp workbook
    temp_wb.sheets[0].delete()  # Delete default empty sheet

    # Save as HTML (this preserves Excel styles like colors, borders, etc.)
    temp_wb.save(output_file)  # Auto-detects .html from extension

    # Clean up
    temp_wb.close()
    wb.close()
finally:
    app.quit()
