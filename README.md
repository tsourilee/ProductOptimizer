# ProductOptimizer

A modern web application for optimizing product listings and analytics using Next.js, React, and AI capabilities.

## Features
- Product listing optimization with AI-powered suggestions
- Image analysis and enhancement using AWS Rekognition
- Integration with Shopify for seamless product management
- Real-time analytics dashboard
- Data visualization with Chart.js and Recharts

## Tech Stack
- Next.js 15.2.2
- React 19.0.0
- TypeScript
- TailwindCSS
- TensorFlow.js
- AWS Rekognition
- Shopify API
- Chart.js & Recharts

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Shopify Developer Account (for API access)
- AWS Account (for Rekognition)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tsourilee/ProductOptimizer.git
cd ProductOptimizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
SHOPIFY_SHOP_NAME=your_shop_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
NEXT_AUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Development Setup
- The project uses Next.js with TypeScript
- TailwindCSS for styling
- ESLint for code linting
- Prettier for code formatting

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
For support, please open an issue in the GitHub repository or contact the maintainers.
