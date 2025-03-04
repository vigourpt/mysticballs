# Changelog

All notable changes to the MYSTICBALLS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation for the project
- Application analysis report with recommendations for improvements
- "Reset Counter" button for non-logged-in users to manually reset their free readings counter

### Fixed
- Bug where users were incorrectly redirected to login screen despite having free readings available
- Issue with localStorage tracking of free readings that could cause incorrect counting

## [1.0.0] - 2025-02-01

### Added
- Initial release of MYSTICBALLS
- 12 different reading types: Tarot, Numerology, Astrology, Oracle Cards, Runes, I Ching, Angel Numbers, Horoscope, Dream Analysis, Magic 8 Ball, Aura Reading, and Past Life Reading
- User authentication with email/password and Google OAuth
- Freemium model with limited free readings
- Stripe integration for subscription payments
- OpenAI integration for generating readings
- Dark/light mode toggle
- Responsive design for mobile and desktop
- FAQ section
- Privacy Policy and Terms of Service pages

## [0.9.0] - 2025-01-15

### Added
- Payment integration with Stripe
- Subscription management
- Premium user features

### Changed
- Improved UI/UX for reading forms
- Enhanced reading output formatting

### Fixed
- Authentication flow issues
- Mobile responsiveness issues

## [0.8.0] - 2025-01-01

### Added
- Past Life Reading
- Aura Reading
- Magic 8 Ball
- Dream Analysis

### Changed
- Improved OpenAI prompts for better readings
- Enhanced error handling

## [0.7.0] - 2024-12-15

### Added
- Angel Numbers Reading
- Daily Horoscope
- User profile page
- Reading history

### Fixed
- Form validation issues
- Authentication edge cases

## [0.6.0] - 2024-12-01

### Added
- I Ching Reading
- Runes Reading
- Oracle Card Reading
- Dark/light mode toggle

### Changed
- Improved UI design
- Better mobile responsiveness

## [0.5.0] - 2024-11-15

### Added
- Astrology Reading
- Numerology Reading
- FAQ section
- Loading indicators

### Fixed
- Performance issues
- API error handling

## [0.4.0] - 2024-11-01

### Added
- Tarot Reading
- User authentication
- Basic user profiles

### Changed
- Migrated to Vite from Create React App
- Updated to React 18

## [0.3.0] - 2024-10-15

### Added
- Supabase integration
- Database schema
- Authentication flow

### Changed
- Improved project structure
- Enhanced TypeScript types

## [0.2.0] - 2024-10-01

### Added
- Basic UI components
- Tailwind CSS integration
- Responsive layout

## [0.1.0] - 2024-09-15

### Added
- Initial project setup
- React with TypeScript
- Vite build system
- Basic routing

## Versioning Guidelines

### Version Format

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version when you make incompatible API changes (X.y.z)
- **MINOR** version when you add functionality in a backward compatible manner (x.Y.z)
- **PATCH** version when you make backward compatible bug fixes (x.y.Z)

### Release Process

1. Update the version number in `package.json`
2. Update this changelog with the new version
3. Create a git tag for the version
4. Push the tag to the repository
5. Create a GitHub release

### Changelog Format

Each version should include the following sections as needed:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Future Plans

See the [ROADMAP.md](../ROADMAP.md) file for planned future enhancements.
