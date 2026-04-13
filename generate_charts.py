import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create an output directory for the charts if it doesn't exist
output_dir = 'chart_outputs'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Read the local CSV
print("Loading climate data...")
df = pd.read_csv('climate_change_impact_on_agriculture_2024.csv')

# 1. Pychart (Pie Chart) - Crop Type Distribution
print("Generating Crop Distribution Pie Chart...")
crop_counts = df['Crop_Type'].value_counts()
plt.figure(figsize=(10, 8))
plt.pie(crop_counts, labels=crop_counts.index, autopct='%1.1f%%', startangle=140, colors=sns.color_palette('pastel'))
plt.title('Global Crop Type Distribution Records')
plt.axis('equal') 
plt.savefig(os.path.join(output_dir, 'crop_distribution_pie.png'), bbox_inches='tight', dpi=300)
plt.close()

# 2. Pychart (Pie Chart) - Adaptation Strategies
print("Generating Adaptation Strategies Pie Chart...")
adapt_counts = df['Adaptation_Strategies'].value_counts()
plt.figure(figsize=(10, 8))
plt.pie(adapt_counts, labels=adapt_counts.index, autopct='%1.1f%%', startangle=140, colors=sns.color_palette('Set2'))
plt.title('Adoption of Climate Adaptation Strategies')
plt.axis('equal')
plt.savefig(os.path.join(output_dir, 'adaptation_strategies_pie.png'), bbox_inches='tight', dpi=300)
plt.close()

# 3. Bar Chart Comparison - Average Yield per Country
print("Generating Average Yield by Country Comparison...")
plt.figure(figsize=(12, 6))
yield_by_country = df.groupby('Country')['Crop_Yield_MT_per_HA'].mean().sort_values(ascending=False)
sns.barplot(x=yield_by_country.index, y=yield_by_country.values, palette='viridis')
plt.title('Average Crop Yield by Country (MT per HA)')
plt.ylabel('Yield (MT/HA)')
plt.xlabel('Country')
plt.xticks(rotation=45)
plt.savefig(os.path.join(output_dir, 'average_yield_comparison_bar.png'), bbox_inches='tight', dpi=300)
plt.close()

# 4. Scatter Plot Comparison - Fertilizer vs Yield
print("Generating Fertilizer vs Yield Scatter Comparison...")
plt.figure(figsize=(10, 6))
# Sample a smaller subset so the scatter isn't just a blob for 10000 points
sample_df = df.sample(n=1000, random_state=42)
sns.scatterplot(data=sample_df, x='Fertilizer_Use_KG_per_HA', y='Crop_Yield_MT_per_HA', hue='Crop_Type', alpha=0.6)
plt.title('Fertilizer Use vs Crop Yield (Sampled)')
plt.ylabel('Yield (MT/HA)')
plt.xlabel('Fertilizer Use (KG/HA)')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.savefig(os.path.join(output_dir, 'fertilizer_yield_scatter.png'), bbox_inches='tight', dpi=300)
plt.close()

print(f"All charts successfully generated and saved to the '{output_dir}' directory.")
