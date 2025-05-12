import pandas as pd

# Load Excel file and target sheet
df = pd.read_excel("Vocabulary.xlsx", sheet_name="Grammatik")

# Convert to HTML (basic, no styles)
html = df.to_html(index=False, border=1)

# Save to a file
with open("grammatik_table.html", "w", encoding="utf-8") as f:
    f.write(html)
