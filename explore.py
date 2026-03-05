import pandas as pd
import glob
import sys

files = glob.glob('*.csv') + glob.glob('archive*/*.csv')

with open('dataset_info.txt', 'w') as f:
    for file in files:
        f.write(f"\n--- {file} ---\n")
        try:
            df = pd.read_csv(file)
            f.write(f"Num rows: {len(df)}\n")
            f.write(f"Num cols: {len(df.columns)}\n")
            f.write(f"Columns: {df.columns.tolist()[:20]} ...\n")
            if len(df) > 0:
                f.write(f"Head: {df.head(1).to_dict('records')}\n")
        except Exception as e:
            f.write(f"Error reading {file}: {e}\n")
