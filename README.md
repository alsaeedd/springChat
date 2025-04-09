# SpringChat💬

A real-time messaging application built with modern technologies that enables secure, responsive communication.

## Overview

SpringChat is a full-stack web application that demonstrates how to build a real-time chat system with user authentication, message persistence, and responsive design. This project showcases the integration of Spring Boot, Angular, Keycloak, WebSockets, and Bootstrap to create a production-ready messaging platform.

## Features

- **Real-time messaging** using WebSocket technology
- **User authentication and authorization** with Keycloak
- **Responsive UI** built with Angular 19 and Bootstrap
- **Message persistence** with database storage
- **User presence indicators** (online/offline status)
- **Read receipts** for messages
- **Media sharing** capabilities

## Technology Stack

### Backend
- **Spring Boot** - Java-based framework for building the server-side application
- **Spring WebSocket** - For real-time communication
- **Spring Security** - Security framework integrated with Keycloak
- **Spring Data JPA** - For database operations

### Frontend
- **Angular 19** - TypeScript-based web application framework
- **Bootstrap 5** - For responsive styling
- **RxJS** - For reactive programming

### Authentication
- **Keycloak** - Open source identity and access management

### Database
- **MySQL** - For data persistence

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18.x or higher
- npm 9.x or higher
- MySQL 8.x
- Docker


## Project Structure
### AWS Deployment Architecture
The project utilizes AWS cloud infrastructure for scalable and secure deployment:
- **Compute**: EC2 instance running Docker containers for backend and Keycloak
- **Database**: RDS MySQL for persistent data storage
- **Frontend**: S3 static website hosting with CloudFront CDN
- **Authentication**: Keycloak deployed on Docker on the same EC2 instance
- **Infrastructure as Code**: Managed using Pulumi for reproducible deployments

### AWS Services Utilized
- **Amazon EC2**: Hosts Spring Boot backend and Keycloak
- **Amazon RDS**: Managed MySQL database
- **Amazon S3**: Frontend static website hosting
- **Amazon CloudFront**: Content delivery network for frontend
- **AWS IAM**: Secure access management

### Deployment Highlights
- Containerized application using Docker Compose
- HTTPS enabled for all services
- Automated infrastructure provisioning
- Secure network configuration with VPC and security groups

## Security

This application implements security best practices:
- OAuth 2.0 and OpenID Connect with Keycloak
- HTTPS support (in production)
- CSRF protection
- XSS prevention

## Future Enhancements

- End-to-end encryption
- Push notifications
- Voice and video calling
- Group chat functionality
- Message search

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Thanks to [@ali-bouali](https://github.com/ali-bouali) for an amazing guide! Please keep up your great work sir.
- Spring Boot and Angular communities for their excellent documentation
- Keycloak for providing robust authentication and authorization
