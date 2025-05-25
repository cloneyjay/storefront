# Storefront Builder

A lightweight Progressive Web App (PWA) designed to help small traders and business owners track their income and expenses in real-time using innovative voice and photo input methods.

## Description

Storefront Builder addresses a critical challenge faced by many small traders: the lack of proper financial tracking. Many small business owners don't monitor their income or expenses systematically, making it difficult to understand their profitability. This application provides an intuitive, mobile-first solution that enables users to:

- Track transactions through voice commands ("Sold 3 loaves for 150 shillings")
- Upload receipt photos with OCR text extraction
- View real-time financial insights and profit calculations
- Manage custom categories and business preferences
- Access their data across devices with offline capabilities


The goal is to democratize financial tracking for small businesses by making it as simple as speaking into your phone or taking a photo.

## Features

### 🎤 **Voice Input**

- Real-time speech-to-text transcription
- Smart transaction parsing from natural language
- Support for multiple languages and currencies
- Voice command testing and validation


### 📸 **Photo Input**

- Receipt image upload and processing
- OCR text extraction (ready for integration)
- Image optimization and storage
- Receipt history and management


### 📊 **Real-time Dashboard**

- Live financial metrics (Income, Expenses, Net Profit)
- Interactive charts showing 7-day trends
- Transaction count and category breakdowns
- Mobile-responsive design


### 🏷️ **Custom Categories**

- Create personalized income and expense categories
- Color-coded organization system
- Category-based filtering and reporting
- Default categories for quick setup


### 🎨 **Theme Customization**

- Light, dark, and system theme modes
- Multiple color schemes (Blue, Green, Purple, Orange, Red)
- Persistent theme preferences
- Real-time theme preview


### 👤 **Profile Management**

- Profile picture upload and management
- Multi-currency support (USD, EUR, GBP, KES, NGN, ZAR)
- Language preferences
- User activity tracking


### 🔐 **Authentication & Security**

- Email verification system
- Secure user authentication via Supabase
- Row-level security (RLS) policies
- Password reset functionality


### 📱 **Progressive Web App**

- Offline functionality
- App-like experience on mobile devices
- Push notification support (ready for implementation)
- Responsive design for all screen sizes


### 🧪 **Testing & Debugging**

- Comprehensive voice input testing
- Image upload validation
- System diagnostics and configuration checks
- Real-time error reporting


## Technologies Used

### **Frontend**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Recharts** - Data visualization library
- **Lucide React** - Icon library


### **Backend & Database**

- **Supabase** - Backend-as-a-Service

- PostgreSQL database
- Authentication system
- File storage
- Real-time subscriptions



- **Row Level Security (RLS)** - Database security


### **APIs & Services**

- **Web Speech API** - Browser-native voice recognition
- **Supabase Storage** - File and image storage
- **Vercel** - Deployment and hosting platform


### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control


## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** for backend services
- **Vercel account** (optional, for deployment)


### Step-by-Step Setup

1. **Clone the repository**

```shellscript
git clone https://github.com/your-username/storefront-builder.git
cd storefront-builder
```


2. **Install dependencies**

```shellscript
npm install
# or
yarn install
```


3. **Set up Supabase**

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Run the database setup scripts provided in the project



4. **Configure environment variables**

```shellscript
cp .env.example .env.local
```

Add your Supabase credentials:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```


5. **Run database migrations**

1. Execute the SQL scripts in the following order:

1. `create-database-schema.sql`
2. `create-avatar-storage.sql`
3. `add-user-preferences-table.sql`






6. **Start the development server**

```shellscript
npm run dev
# or
yarn dev
```


7. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)


## Usage

### Getting Started

1. **Sign Up**

1. Click "Get Started" on the homepage
2. Enter your email, password, and full name
3. Verify your email address



2. **Dashboard Overview**

1. View your financial metrics at a glance
2. See recent transactions and trends
3. Access quick action buttons for adding transactions





### Adding Transactions

#### Manual Entry

- Click "Add Manual" button
- Fill in amount, description, type, and category
- Save the transaction


#### Voice Input

- Click "Voice" button
- Speak your transaction: "Sold 5 items for 200 dollars"
- Review the parsed information and save


#### Photo Upload

- Click "Photo" button
- Take a photo or upload a receipt image
- Review extracted information and save


### Profile Customization

1. **Access Profile Settings**

1. Click your avatar in the top-right corner
2. Select "Profile & Settings"



2. **Update Profile**

1. Upload a profile picture
2. Update personal information
3. Change currency and language preferences



3. **Manage Categories**

1. Create custom income and expense categories
2. Assign colors for easy identification
3. Edit or delete existing categories



4. **Theme Customization**

1. Choose between light, dark, or system theme
2. Select your preferred color scheme
3. Preview changes in real-time





### Testing Features

- Use the Testing tab in Profile Settings to:

- Test voice recognition accuracy
- Validate image upload functionality
- Run system diagnostics





## Configuration

### Environment Variables

| Variable | Description | Required | Default
|-----|-----|-----|-----
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | -
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes | -
| `NEXT_PUBLIC_SITE_URL` | Your application's URL | Yes | [http://localhost:3000](http://localhost:3000)
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side) | No | -


### Supabase Configuration

1. **Authentication Settings**

1. Site URL: Set to your deployed domain
2. Redirect URLs: Add your auth confirmation URL
3. Email templates: Customize verification emails



2. **Storage Configuration**

1. Create `avatars` bucket for profile pictures
2. Create `receipts` bucket for transaction images
3. Configure RLS policies for secure access



3. **Database Setup**

1. Run provided SQL migration scripts
2. Set up Row Level Security policies
3. Configure database triggers for user creation





### PWA Configuration

The app includes a Web App Manifest (`app/manifest.ts`) that can be customized:

- App name and description
- Theme colors
- Icon specifications
- Display mode preferences


## API Reference

### Authentication Endpoints

The application uses Supabase Auth, which provides:

- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token` - User login
- `POST /auth/v1/logout` - User logout
- `POST /auth/v1/recover` - Password reset


### Database Tables

#### Profiles

```sql
profiles (
  id: UUID (Primary Key),
  email: TEXT,
  full_name: TEXT,
  avatar_url: TEXT,
  currency: TEXT,
  language: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

#### Transactions

```sql
transactions (
  id: UUID (Primary Key),
  user_id: UUID (Foreign Key),
  category_id: UUID (Foreign Key),
  amount: DECIMAL,
  description: TEXT,
  type: TEXT ('income' | 'expense'),
  input_method: TEXT ('manual' | 'voice' | 'photo'),
  receipt_image_url: TEXT,
  transaction_date: DATE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

#### Categories

```sql
categories (
  id: UUID (Primary Key),
  user_id: UUID (Foreign Key),
  name: TEXT,
  type: TEXT ('income' | 'expense'),
  color: TEXT,
  created_at: TIMESTAMP
)
```

## Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**

```shellscript
git checkout -b feature/your-feature-name
```


3. **Make your changes**
4. **Write or update tests**
5. **Commit your changes**

```shellscript
git commit -m "Add: your feature description"
```


6. **Push to your fork**

```shellscript
git push origin feature/your-feature-name
```


7. **Create a Pull Request**


### Contribution Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features
- **Documentation**: Update README and code comments
- **Issues**: Check existing issues before creating new ones


### Areas for Contribution

- OCR integration for receipt processing
- Additional language support
- Enhanced voice recognition
- Mobile app development
- Performance optimizations
- Accessibility improvements


### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards


## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```plaintext
MIT License

Copyright (c) 2024 Storefront Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgments

- **Supabase** - For providing an excellent backend-as-a-service platform
- **Vercel** - For seamless deployment and hosting
- **shadcn/ui** - For beautiful, accessible UI components
- **Next.js Team** - For the amazing React framework
- **Open Source Community** - For the countless libraries and tools that make this project possible


Special thanks to all the small traders and business owners who inspired this project and provided valuable feedback during development.

## Contact

### Project Maintainers

- **Email**: [your-email@example.com](mailto:jamesangatia445@gmail.com)
- **GitHub**: [@your-username](https://github.com/cloneyjay)
- **Twitter**: [@your-twitter](https://twitter.com/48__400)


### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/cloneyjay/storefront-builder/issues)
- **Discussions**: [Join community discussions](https://github.com/cloneyjay/storefront-builder/discussions)

### Support

If you need help with setup, have questions about usage, or want to report a bug:

1. Check the [FAQ section](https://github.com/cloneyjay/storefront-builder/wiki/FAQ)
2. Search [existing issues](https://github.com/cloneyjay/storefront-builder/issues)
3. Create a [new issue](https://github.com/cloneyjay/storefront-builder/issues/new) with detailed information


## Project Structure

```plaintext
storefront-builder/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   └── confirm/              # Email verification
│   ├── dashboard/                # Main dashboard
│   ├── debug/                    # Debug and testing tools
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── manifest.ts               # PWA manifest
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── add-transaction-dialog.tsx
│   ├── auth-modals.tsx
│   ├── dashboard-chart.tsx
│   ├── header.tsx
│   ├── profile-modal.tsx
│   └── transaction-list.tsx
├── contexts/                     # React contexts
│   ├── auth-context.tsx          # Authentication state
│   └── theme-context.tsx         # Theme management
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── use-voice-input.ts
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── supabase-server.ts        # Server-side client
│   ├── url-utils.ts              # URL utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
│   └── index.ts
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   └── manifest.json             # PWA manifest
├── sql/                          # Database migration scripts
│   ├── create-database-schema.sql
│   ├── create-avatar-storage.sql
│   └── add-user-preferences-table.sql
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Testing

### Testing Strategy

The project includes multiple testing approaches:

1. **Unit Testing** - Component and utility function tests
2. **Integration Testing** - API and database interaction tests
3. **E2E Testing** - Full user workflow tests
4. **Manual Testing** - Voice and image functionality validation


### Running Tests

```shellscript
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Voice Input Testing

Use the built-in testing tools:

1. Navigate to Profile Settings → Testing tab
2. Test voice recognition with various phrases
3. Validate transcription accuracy
4. Save test results for analysis


### Image Upload Testing

1. Use the Testing tab to upload sample images
2. Verify file size and format validation
3. Test image preview functionality
4. Validate storage integration


### Debug Tools

Access comprehensive debugging at `/debug/auth`:

- Environment configuration validation
- Supabase connection testing
- Email verification flow testing
- URL configuration verification


## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**

```shellscript
npm install -g vercel
vercel login
vercel
```


2. **Configure Environment Variables**

1. Add all required environment variables in Vercel dashboard
2. Update `NEXT_PUBLIC_SITE_URL` to your production domain



3. **Update Supabase Configuration**

1. Set Site URL to your Vercel domain
2. Add redirect URLs for authentication
3. Update email templates with production URLs



4. **Deploy**

```shellscript
vercel --prod
```




### Manual Deployment

1. **Build the application**

```shellscript
npm run build
```


2. **Start production server**

```shellscript
npm start
```




### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configurations

#### Development

- Use localhost URLs
- Enable debug logging
- Hot reloading enabled


#### Staging

- Use staging Supabase project
- Enable error tracking
- Performance monitoring


#### Production

- Use production Supabase project
- Enable analytics
- Optimize for performance
- Configure CDN for static assets


### Post-Deployment Checklist

- Verify email verification works
- Test voice input functionality
- Validate image upload and storage
- Check theme persistence
- Verify PWA installation
- Test offline functionality
- Validate responsive design
- Check performance metrics
- Monitor error rates
- Verify security headers


---

**Built with ❤️ for small traders and business owners worldwide.**
