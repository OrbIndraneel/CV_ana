import os
import glob

def replace_colors():
    src_dir = os.path.join(os.path.dirname(__file__), 'src')
    files = glob.glob(os.path.join(src_dir, '**', '*.tsx'), recursive=True)
    
    replacements = {
        'text-[#FDFBF7]': 'text-slate-900',
        'text-[#D7C4A5]': 'text-slate-600',
        'text-[#AF9B7B]': 'text-slate-500',
        'text-[#E3D5C8]': 'text-slate-700',
        'text-[#F3EFE9]': 'text-slate-800',
        # Backgrounds or borders that might also be white? Let's stick to text for now.
    }
    
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

if __name__ == '__main__':
    replace_colors()
