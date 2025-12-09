# Investor Pro Forma Tool

A professional-grade real estate investment analysis platform. Build comprehensive pro forma models with zero assumptions and maximum flexibility.

![Investor Pro](https://via.placeholder.com/800x400?text=Investor+Pro+Forma+Tool)

## ✨ Features

- **Zero Assumptions** - Every critical field is user-input, no hidden defaults
- **Flexible Hold Periods** - Model 1 to 50 years with annual, quarterly, or monthly granularity
- **Any Financing Structure** - Cash, single loan, stacked capital, JV splits, waterfalls
- **Comprehensive Expense Tracking** - Complete operating expense taxonomy
- **Dynamic Property Types** - Industrial, Office, Retail, Multifamily, and more
- **Professional Outputs** - IRR, Equity Multiple, Cash-on-Cash, Sensitivity Analysis
- **PDF/Excel Export** - Share investor-grade documents

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication & database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ZacharyVorsteg/Investing_Pro_Forma_Project.git
cd Investing_Pro_Forma_Project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the database migrations:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Run the contents of `supabase/schema.sql`

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/        # Sidebar, Layout components
│   ├── sections/      # Pro forma sections (Property, Acquisition, etc.)
│   └── ui/            # Reusable UI components
├── lib/               # Supabase client
├── pages/             # Route pages
├── store/             # Zustand state management
├── types/             # TypeScript definitions
└── App.tsx            # Main app with routing
```

## 📊 Pro Forma Sections

1. **Property** - Address, sizing, property type
2. **Acquisition** - Purchase price, closing costs, basis
3. **Financing** - Debt tranches, equity structure, fees
4. **Income** - Rent roll, other income, vacancy
5. **Expenses** - Complete operating expense breakdown
6. **Capital** - Reserves, CapEx schedule, TI/LC
7. **Growth & Exit** - Growth assumptions, exit cap rate
8. **Pro Forma** - Year-by-year projections, returns

## 🌐 Deployment

### Netlify Deployment

This project is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Environment Variables for Production

Set these in your Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📝 Key Formulas

```
NOI = EGI - Operating Expenses
EGI = GPR - Vacancy - Credit Loss + Other Income
Cap Rate = NOI / Value
Cash-on-Cash = Annual CF After Debt / Equity Invested
DSCR = NOI / Debt Service
Debt Yield = NOI / Loan Amount
Equity Multiple = Total Distributions / Equity Invested
```

## 🎯 Philosophy

> **"Tell us about YOUR deal, we'll build the model"**

- No critical field is pre-filled
- Smart prompts, not smart defaults
- Dynamic structure based on deal type
- "Help me calculate" options
- Every assumption is transparent and editable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects.

## 🙏 Acknowledgments

Built with ❤️ for real estate investors who demand precision and flexibility.

---

**Questions?** Open an issue or reach out to the team.
