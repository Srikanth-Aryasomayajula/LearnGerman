from xlsx2html import xlsx2html

# Convert only the "Grammatik" sheet to HTML
xlsx2html("Vocabulary.xlsx", "grammatik_table.html", sheetnames=["Grammatik"])
