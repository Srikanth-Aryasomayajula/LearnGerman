import pandas as pd
from xlsx2html import xlsx2html

# Load the specific sheet (Grammatik) from the Excel file
df = pd.read_excel("Vocabulary.xlsx", sheet_name="Grammatik")

# Save the Grammatik sheet to a temporary file
df.to_excel("grammatik_temp.xlsx", index=False)

# Convert the temporary Excel file to HTML
xlsx2html("grammatik_temp.xlsx", "grammatik_table.html")

# Optionally, delete the temporary file after conversion
import os
os.remove("grammatik_temp.xlsx")
