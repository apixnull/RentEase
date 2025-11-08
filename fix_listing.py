# Fix ListingDetails.tsx - remove corrupted line and restructure Current Status sections

with open('frontend/src/pages/private/landlord/listing/ListingDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the corrupted line
lines = content.split('\n')
filtered_lines = [line for line in lines if '7ll notify you once it7s confirmed' not in line]
content = '\n'.join(filtered_lines)

# Now fix the structure: remove top Current Status (587-643), keep bottom one (791-845) and move it to top
# Read again after removing corrupted line
with open('frontend/src/pages/private/landlord/listing/ListingDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed corrupted line")


