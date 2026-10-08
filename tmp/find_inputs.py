import os, re

inputs = []
for root, dirs, files in os.walk("./src"):
    for file in files:
        if file.endswith((".tsx", ".jsx", ".js", ".ts")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            for m in re.finditer(r"<(input|textarea|select)\b([^>]*)/?>", content, re.DOTALL):
                tag_name = m.group(1)
                attrs = m.group(2)
                line = content[:m.start()].count("\n") + 1
                
                type_m = re.search(r'\btype\s*=\s*["\']([^"\']+)["\']', attrs)
                input_type = type_m.group(1) if type_m else "text"
                if input_type in ["file", "submit", "button", "reset"]:
                    continue

                has_value = re.search(r'\bvalue\s*=\s*\{([^}]+)\}', attrs)
                has_checked = re.search(r'\bchecked\s*=\s*\{([^}]+)\}', attrs)
                
                if has_value:
                    val_expr = has_value.group(1).strip()
                    # Check if val_expr is an identifier or property access like item.prop
                    # or if it already has || or ??
                    if not re.search(r'(\|\||\?\?|\?|^\s*["\'`0-9])', val_expr):
                        inputs.append((path, line, tag_name, "value", val_expr))
                elif has_checked:
                    chk_expr = has_checked.group(1).strip()
                    if not re.search(r'(\|\||\?\?|\?|^\s*(true|false|Boolean))', chk_expr):
                        inputs.append((path, line, tag_name, "checked", chk_expr))
                else:
                    # Input without value or defaultValue or checked (except radio/checkbox without checked)
                    has_default = re.search(r'\bdefaultValue\s*=', attrs)
                    if not has_default and input_type not in ["checkbox", "radio"]:
                        inputs.append((path, line, tag_name, "NO_VALUE_PROP", input_type))

print(f"Total potential inputs: {len(inputs)}")
for item in inputs:
    print(f"{item[0]}:{item[1]} <{item[2]} {item[3]}={{{item[4]}}}>")
