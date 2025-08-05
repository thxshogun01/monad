# Monad Voices

A community feedback and contributor showcase platform for the Monad AI community, powered by Supabase.

## Features

- **Community Feedback**: Share thoughts and feedback about Monad AI with categorized tags
- **Contributor Showcase**: Showcase your contributions and projects to the community
- **Modern UI**: Beautiful, responsive design with dark/light mode support
- **Real-time Updates**: Live character counting and form validation
- **Supabase Backend**: Real database storage with Row Level Security

## Getting Started

### Prerequisites
- A Supabase account and project
- Modern web browser

### Setup

1. **Clone the repository**:
```bash
git clone https://github.com/thxshogun01/monad.git
cd monad
```

2. **Set up Supabase Database**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL commands from `database-setup.sql`
   - This will create the necessary tables and security policies

3. **Configure Supabase**:
   - Update `config.js` with your Supabase URL and anon key
   - Or replace the existing credentials with your own

4. **Run the application**:
   - Open `index.html` in your web browser
   - Or serve it using a local server

## Project Structure

```
monad/
├── index.html           # Main HTML file
├── app.js              # JavaScript application logic
├── style.css           # CSS styling and design system
├── config.js           # Supabase configuration
├── database-setup.sql  # Database schema and setup
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and responsive design
- **Vanilla JavaScript**: ES6+ features, no frameworks required
- **Supabase**: Backend-as-a-Service with PostgreSQL database

## Features

### Community Feedback
- Submit feedback with tags (Recognition, Concerns, Ideas, Community Fun)
- Character-limited text areas (500 characters max)
- Real-time character counting
- Form validation
- Persistent storage in Supabase

### Contributor Showcase
- Showcase contributions with Twitter/X handles
- Optional project links
- Contribution descriptions
- Persistent storage in Supabase

### UI/UX
- Tab-based navigation
- Success modals with animations
- Loading states
- Responsive design
- Dark/light mode support
- Accessibility features

### Backend Features
- PostgreSQL database with Supabase
- Row Level Security (RLS) policies
- Real-time data synchronization
- Automatic timestamps
- Data validation

## Database Schema

### Feedback Table
- `id`: UUID primary key
- `message`: Text content (max 500 chars)
- `tag`: Categorized tag (Recognition, Concerns, Ideas, Community Fun)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Contributors Table
- `id`: UUID primary key
- `x_handle`: Twitter/X handle
- `contribution`: Contribution description
- `project_link`: Optional project URL
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Security

- Row Level Security (RLS) enabled
- Anonymous read/write access for community participation
- Input validation and sanitization
- CORS protection through Supabase

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Community

Join the Monad AI community and share your voice!
