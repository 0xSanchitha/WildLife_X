import rebuild_app

app_content = rebuild_app.part1_imports_and_seed + rebuild_app.part2_logic
app_path = r"c:\Users\Sandun Shyamantha\Desktop\Project\backend\app.py"

with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_content)

print("Successfully reconstructed app.py!")
