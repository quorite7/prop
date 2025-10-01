# UK Home Improvement Platform - Comprehensive Requirements Document

## Executive Summary

The UK Home Improvement Platform is a sophisticated web application that connects homeowners with qualified builders through an AI-powered project management system. The platform streamlines the entire home improvement journey from initial project conception to completion, with emphasis on compliance with UK building regulations and best practices.

## 1. System Architecture & Technical Stack

### 1.1 Core Success Principles

- **User Experience Excellence**: Smooth, intuitive user flows are critical for startup success
- **SoW Quality**: AI-generated Statement of Work quality is the primary differentiator
- **Performance Optimization**: Focus on perceived performance and user satisfaction over raw metrics
- **Startup Scalability**: Build for hundreds of users initially with ability to scale

### 1.2 Frontend Architecture

- **Framework**: React 18.2.0 with TypeScript
- **UI Library**: Material-UI (MUI) v5.14.20
- **State Management**: React Context API with React Query for server state
- **Routing**: React Router DOM v6.19.0
- **Form Management**: React Hook Form v7.48.2 with Yup validation
- **File Handling**: React Dropzone v14.2.3
- **Real-time Communication**: Socket.io-client v4.7.4

### 1.3 Backend Architecture

- **Runtime**: AWS Lambda (Node.js 18.x)
- **Database**: Amazon DynamoDB with multiple tables
- **Authentication**: AWS Cognito User Pools
- **File Storage**: Amazon S3
- **AI Integration**: AWS Bedrock (Claude/Anthropic models)
- **API Gateway**: AWS API Gateway for REST endpoints
- **Infrastructure**: AWS CloudFormation for IaC

### 1.4 Key Database Tables

- `uk-home-projects`: Main project data
- `uk-home-documents`: Document metadata and S3 references
- `builder-invitations`: Secure invitation codes for builders
- `project-access`: Builder access control
- `project-quotes`: Quote submissions from builders
- `questionnaire-sessions`: AI-driven questionnaire responses
- `sow-tasks`: Statement of Work task breakdown
- `sow-versions`: SoW version control and collaborative editing
- `conversations`: Real-time communication threads
- `messages`: Chat messages and communication history
- `email-notifications`: Offline message delivery tracking
- `hot-leads`: Marketplace leads for builder sales
- `builder-work-history`: Builder project history and locations
- `lead-purchases`: Builder lead purchase tracking
- `selection-feedback`: Homeowner feedback on builder selection
- `builder-analytics`: Performance metrics and analytics
- `planning-prospects`: Extracted planning permission data for marketing
- `planning-applications`: Batch-extracted planning application data from council websites
- `party-wall-templates`: Admin-managed party wall agreement templates
- `party-wall-agreements`: Homeowner-created party wall agreements
- `neighbor-responses`: Neighbor approvals/rejections for party wall agreements
- `meeting-verifications`: Face-to-face meeting confirmations
- `admin-configurations`: System configuration and settings
- `platform-analytics`: Business metrics and statistics
- `audit-log`: System audit trail

## 2. User Roles & Authentication System

### 2.1 User Types

1. **Homeowners**: Primary users who create and manage projects
2. **Builders**: Invited professionals who view projects and submit quotes
3. **System Administrators**: Platform management with full system control and analytics

### 2.2 Authentication Flow

- **Registration**: Email-based with Cognito verification
- **Login**: Cognito token-based authentication
- **Password Recovery**: Secure reset flow via email
- **Role-based Access Control**: Enforced at API and UI levels
- **Session Management**: Automatic Cognito token refresh and logout

### 2.3 Security Features

- Cognito token validation on all protected endpoints
- User-project association enforcement
- Role-based route protection
- Secure builder invitation system with expiring codes
- Audit logging for all critical operations

## 3. Core User Journeys & Workflows

### 3.1 Homeowner Journey

#### 3.1.1 Project Creation Workflow

1. **Landing Page**: Professional marketing page with testimonials
2. **Registration/Login**: Secure account creation
3. **Project Type Selection**: 25+ predefined project types with enhanced UI
4. **Property Address Entry**: UK postcode validation and council data lookup
5. **Project Vision Definition**: Detailed requirements capture
6. **Document Upload**: Plans, photos, and supporting documents
7. **Property Assessment**: Automated compliance checking
8. **Project Review**: Final validation before creation

#### 3.1.2 Project Management Workflow

1. **Project Dashboard**: Central hub showing all user projects
2. **Individual Project Pages**: Detailed project management interface
3. **AI-Powered Questionnaire**: Dynamic question generation based on project type
4. **Statement of Work (SoW) Generation**: AI-powered comprehensive work specification
5. **Builder Invitation System**: Secure invitation code generation and management
6. **Quote Management**: Review and compare builder submissions
7. **Contract Generation**: Automated contract creation (future scope)
8. **Progress Tracking**: Real-time project status updates

### 3.2 Builder Journey

#### 3.2.1 Invitation & Registration

1. **Invitation Receipt**: Email with unique 8-character code (7-day expiry)
2. **Registration with Code**: Auto-populated form with project preview
3. **Profile Creation**: Company details, certifications, portfolio
4. **Dashboard Access**: Project-specific access control

#### 3.2.2 Builder Performance Analytics & Intelligence

1. **Win/Loss Analysis**: Comprehensive analytics on quote success rates across all channels
2. **Selection Feedback**: Detailed homeowner feedback on why quotes were accepted/rejected
3. **Financial Performance**: Analysis of winning pricing strategies, payment terms, and value propositions
4. **Channel Performance**: Compare success rates between direct invitations vs. hot leads
5. **Competitive Intelligence**: Anonymous benchmarking against market averages
6. **Improvement Recommendations**: AI-powered suggestions for better conversion rates

#### 3.2.3 Hot Leads Marketplace Access

1. **Lead Discovery Interface**: Browse available leads with limited information
2. **Lead Preview**: Partial project details without exact address
3. **Lead Purchase Flow**: Payment processing for full lead access
4. **Full Lead Details**: Complete project information after payment
5. **Lead Management**: Track purchased leads and conversion rates
6. **Project Discovery**: View invited projects only
7. **SoW Review**: Comprehensive work specification analysis
8. **Quote Preparation**: Detailed pricing and timeline submission
9. **Communication**: Direct messaging with homeowners (future scope)
10. **Contract Acceptance**: Digital contract signing (future scope)

### 3.3 System Administrator Journey

#### 3.3.1 Admin Portal Access & Authentication

1. **Super Admin Login**: Enhanced security with MFA requirement
2. **Role-Based Admin Access**: Different permission levels for admin users
3. **Audit Trail Access**: Complete system activity monitoring
4. **Security Dashboard**: Real-time threat detection and response

#### 3.3.2 Business Analytics & Reporting

1. **Platform Statistics Dashboard**:
   - User registration trends and demographics
   - Project creation and completion rates
   - Builder engagement and success metrics
   - Revenue analytics and payment processing stats
   - Geographic distribution of projects and users
2. **Performance Metrics**:
   - System performance and uptime statistics
   - API response times and error rates
   - AI model performance and accuracy metrics
   - User satisfaction and retention analytics
3. **Financial Reporting**:
   - Revenue breakdown by service type
   - Payment processing fees and margins
   - Builder lead sales revenue
   - Cost analysis and profitability metrics

#### 3.3.3 AI/GenAI Management Portal

1. **Model Configuration**:
   - Switch between AI providers (OpenAI, Anthropic, AWS Bedrock, Google)
   - Configure model parameters (temperature, max tokens, etc.)
   - A/B testing different models for SoW generation
   - Cost optimization and usage monitoring
2. **Prompt Engineering**:
   - Manage and version control system prompts
   - Test prompt variations and performance
   - Industry-specific prompt customization
   - Quality assurance for AI-generated content
3. **AI Performance Analytics**:
   - Model accuracy and user satisfaction scores
   - Cost per AI operation and budget management
   - Response time optimization
   - Error rate monitoring and alerting

#### 3.3.4 Payment Provider Management

1. **Multi-Provider Configuration**:
   - Stripe, PayPal, bank transfer integration management
   - Payment method availability by region
   - Fee structure configuration and optimization
   - Fraud detection and prevention settings
2. **Transaction Monitoring**:
   - Real-time payment processing dashboard
   - Failed payment analysis and recovery
   - Refund and dispute management
   - Compliance and regulatory reporting
3. **Revenue Optimization**:
   - Dynamic pricing model configuration
   - Commission structure management
   - Promotional pricing and discount codes
   - Revenue forecasting and planning

#### 3.3.5 Hot Leads Marketplace Management

1. **Lead Generation & Qualification System**:
   - Identify high-value renovation projects from homeowner consent
   - Lead quality scoring based on project value, timeline, and completion probability
   - Geographic categorization and postcode-based targeting
   - Project type and specialty classification
2. **Geographic Targeting Algorithm**:
   - **Similar Work Radius**: Builders who completed similar project types within 20-mile radius of homeowner's postcode
   - **General Work Radius**: Builders who completed any work within 10-mile radius of homeowner's postcode
   - Postcode distance calculation and mapping integration
   - Builder work history and location tracking
3. **Builder Lead Sales Portal**:
   - Targeted lead distribution based on geographic and specialty criteria
   - Tiered pricing: premium for similar work experience, standard for general proximity
   - Lead auction system with competitive bidding
   - Builder subscription and credit management
   - Lead performance tracking and ROI analytics
4. **Marketplace Analytics & Optimization**:
   - Lead conversion rates by geographic distance and specialty match
   - Builder satisfaction and lead quality feedback
   - Revenue optimization from geographic and specialty targeting
   - Market demand analysis and dynamic pricing
   - Success rate correlation between distance/specialty and project completion

#### 3.3.6 Platform Configuration & Control

1. **System Settings Management**:
   - Feature flags and rollout control
   - Regional settings and localization
   - Compliance and regulatory updates
   - Emergency system controls and maintenance mode
2. **User Management**:
   - User account administration and support
   - Bulk operations and data management
   - Fraud detection and account security
   - Customer support ticket management
3. **Content Management**:
   - Project type definitions and updates
   - Building regulation updates and compliance
   - Marketing content and messaging
   - Legal document templates and updates

## 4. Feature Specifications

### 4.1 AI-Powered Questionnaire System

#### 4.1.1 Dynamic Question Generation

- **Context-Aware**: Questions based on project type, location, and previous responses
- **Document Integration**: Analyzes uploaded documents to avoid redundant questions
- **Progressive Enhancement**: Follow-up questions based on responses
- **UK Compliance Focus**: Questions ensure building regulation compliance

#### 4.1.2 Question Types

- Text input for descriptions
- Multiple choice for standardized options
- Numeric input for measurements and budgets
- Boolean for yes/no decisions
- Scale ratings for preferences
- **Document upload for supporting files with each question**

#### 4.1.3 Project-Wide Document Duplicate Detection

- **Per-Question Document Upload**: Each question allows multiple document attachments
- **Project-Scoped Duplicate Detection**:
  - MD5 hash comparison against ALL documents uploaded for the specific project
  - Applies to documents uploaded during project creation, questionnaire, and any other phase
  - File size and metadata comparison for additional validation
  - Content-based duplicate detection for images using perceptual hashing
- **Smart Duplicate Alerts**:
  - Real-time duplicate detection before upload completion
  - User-friendly alerts showing original upload location and timestamp
  - Option to proceed with duplicate or cancel upload
  - Visual comparison for image duplicates
- **Document Management**:
  - Centralized document registry per project with MD5 tracking
  - Document categorization based on upload context (project creation, Q&A, manual upload)
  - Document preview and metadata display during duplicate confirmation

#### 4.1.3 Response Management

- Real-time validation and saving
- Progress tracking with completion percentage
- Review and edit capabilities
- Export functionality for records

### 4.2 AI-Powered Statement of Work (SoW) Generation

#### 4.2.1 Content Generation

- **UK Building Regulations Compliance**: Automatic reference to relevant regulations
- **RIBA Work Stages**: Structured according to Royal Institute of British Architects stages
- **Detailed Specifications**: Material specifications, quantities, and quality standards
- **Timeline Planning**: Realistic project scheduling with dependencies
- **Risk Assessment**: Identification of potential issues and mitigation strategies

#### 4.2.2 SoW Structure

- Executive summary
- Project scope and objectives
- Detailed work breakdown structure
- Material specifications and standards
- Quality assurance requirements
- Health and safety considerations
- Planning permission requirements
- Building control notifications
- Completion criteria and sign-off procedures

#### 4.2.3 Gantt Chart Timeline Visualization

- **Interactive Gantt Chart**: Visual timeline showing all project phases and tasks
- **Parallel Work Streams**: Display concurrent activities and trade coordination
- **Critical Path Analysis**: Highlight critical tasks that affect project completion
- **Dependency Mapping**: Show task dependencies and sequencing requirements
- **Milestone Tracking**: Key project milestones and inspection points
- **Resource Allocation**: Visual representation of trade scheduling and overlap
- **Timeline Export**: Export Gantt chart as PDF or image for sharing with builders
- **Real-time Updates**: Dynamic updates when SoW is modified or project changes

#### 4.2.4 Document Management

- Version control for SoW revisions
- PDF generation for sharing
- Builder-specific access control
- Integration with project documents

### 4.3 Builder Invitation & Access Control System

#### 4.3.1 Invitation Generation

- **Unique Codes**: 8-character alphanumeric codes
- **Time-Limited**: 7-day expiration period
- **Email Integration**: Automated invitation emails
- **Copy-to-Clipboard**: Easy sharing functionality
- **Usage Tracking**: Monitor invitation status

#### 4.3.2 Access Control

- **Project-Specific Access**: Builders only see invited projects
- **Role-Based Permissions**: Different capabilities for homeowners vs builders
- **Audit Trail**: Complete access logging
- **Revocation Capability**: Homeowners can revoke builder access

#### 4.3.3 Builder Dashboard

- **Project List**: All accessible projects with status
- **Add Project**: Invitation code entry interface
- **Profile Management**: Company information and certifications
- **Quote History**: Track all submitted quotes

### 4.4 Quote Management System

#### 4.4.1 Quote Submission

- **Structured Format**: Standardized quote templates
- **Line Item Breakdown**: Detailed cost analysis
- **Timeline Specification**: Project scheduling with milestones
- **Terms and Conditions**: Standard contract terms
- **Supporting Documents**: Certifications and references

#### 4.4.2 Quote Comparison

- **Side-by-Side Analysis**: Compare multiple quotes
- **Scoring System**: Automated ranking based on criteria
- **Communication Tools**: Direct messaging with builders
- **Decision Tracking**: Record selection rationale

### 4.5 Document Management System

#### 4.5.1 File Upload & Storage

- **Multiple Formats**: Support for images, PDFs, CAD files
- **S3 Integration**: Secure cloud storage
- **Metadata Management**: File categorization and tagging
- **Version Control**: Track document revisions

#### 4.5.2 Document Processing

- **AI Analysis**: Extract relevant information from documents
- **OCR Capability**: Text extraction from images
- **Compliance Checking**: Validate against building regulations
- **Integration**: Link documents to specific project phases

### 4.7 Hot Leads Marketplace System

#### 4.7.1 Lead Generation & Consent Management

- **Homeowner Consent**: Explicit opt-in for sharing project details with additional builders
- **Lead Qualification**: Automated scoring based on project value, timeline, and homeowner engagement
- **Privacy Controls**: Granular control over what information is shared
- **Consent Tracking**: Complete audit trail of homeowner permissions

#### 4.7.2 Geographic Targeting Engine

- **Postcode Distance Calculation**: Precise distance measurement using UK postcode data
- **Builder Work History Tracking**: Complete database of builder projects and locations
- **Specialty Matching Algorithm**:
  - **Tier 1 (20-mile radius)**: Builders with similar project type experience
  - **Tier 2 (10-mile radius)**: Builders with any relevant construction experience
- **Location Verification**: Validate builder service areas and project locations

#### 4.7.3 Lead Distribution System

- **Automated Matching**: Real-time matching of leads to qualified builders
- **Tiered Pricing Structure**:
  - Premium pricing for specialty match within 20 miles
  - Standard pricing for general match within 10 miles
  - Dynamic pricing based on lead quality and demand
- **Lead Auction System**: Competitive bidding for high-value leads
- **Delivery Mechanism**: Secure lead delivery with contact information and project details

#### 4.7.4 Builder Lead Management

- **Lead Marketplace Dashboard**: Browse available leads by location and specialty
- **Subscription Management**: Monthly/annual subscriptions for lead access
- **Credit System**: Pay-per-lead or credit-based purchasing
- **Lead History**: Track purchased leads and conversion rates
- **Performance Analytics**: ROI tracking and success metrics

#### 4.7.5 Quality Assurance & Feedback

- **Lead Quality Monitoring**: Track lead-to-quote and quote-to-contract conversion
- **Builder Feedback System**: Rate lead quality and accuracy
- **Homeowner Protection**: Ensure only qualified builders receive leads
- **Fraud Prevention**: Detect and prevent fake leads or builder accounts
- **Continuous Improvement**: Machine learning to optimize matching algorithms

### 4.10 Homeowner Selection Feedback System

#### 4.10.1 Quote Selection Interface

- **Multi-Quote Comparison**: Side-by-side comparison of all received quotes
- **Selection Wizard**: Guided process for choosing preferred builder
- **Feedback Collection**: Mandatory feedback form explaining selection criteria
- **Rejection Notifications**: Automated notifications to unsuccessful builders with feedback

#### 4.10.2 Selection Criteria Capture

- **Primary Selection Factors**:
  - Total project cost and value for money
  - Timeline and availability
  - Builder reputation and reviews
  - Payment terms and flexibility
  - Quality of proposal and communication
  - Insurance and certifications
  - Previous work portfolio
- **Financial Preference Analysis**:
  - Budget alignment and cost breakdown clarity
  - Payment schedule preferences (upfront vs. milestone-based)
  - Value-added services and inclusions
  - Warranty and guarantee terms
- **Detailed Feedback Form**:
  - Ranking of importance for each selection factor
  - Specific comments on winning and losing quotes
  - Suggestions for improvement for rejected builders

#### 4.10.3 Builder Feedback Delivery

- **Personalized Reports**: Individual feedback for each builder's quote
- **Anonymous Benchmarking**: Compare performance against other quotes without revealing competitors
- **Improvement Suggestions**: Specific recommendations based on homeowner feedback
- **Trend Analysis**: Historical feedback patterns and market preferences

### 4.11 Builder Analytics Dashboard

#### 4.11.1 Performance Metrics Overview

- **Overall Win Rate**: Success percentage across all quote submissions
- **Channel Performance**:
  - Direct invitations win rate vs. hot leads win rate
  - ROI analysis for hot lead purchases
  - Cost per successful project acquisition
- **Quote Analysis**:
  - Average quote value vs. winning quotes
  - Time from quote submission to decision
  - Quote acceptance rate by project type

#### 4.11.2 Financial Performance Analytics

- **Pricing Strategy Analysis**:
  - Winning quote characteristics (price range, payment terms, inclusions)
  - Price sensitivity analysis by project type and location
  - Optimal pricing recommendations based on historical data
- **Payment Terms Impact**:
  - Success rate by payment schedule type
  - Homeowner preference for upfront vs. milestone payments
  - Impact of warranty terms on selection rates
- **Value Proposition Analysis**:
  - Most valued services and inclusions
  - Premium pricing acceptance for quality indicators
  - Cost breakdown preferences and transparency impact

#### 4.11.3 Competitive Intelligence

- **Market Benchmarking**:
  - Anonymous comparison against market averages
  - Regional pricing trends and competitive positioning
  - Success rate comparison by builder experience level
- **Improvement Opportunities**:
  - AI-powered recommendations for quote optimization
  - Identification of weak areas in proposals
  - Best practice suggestions based on top performers

#### 4.11.4 Feedback Analytics

- **Selection Reason Analysis**:
  - Most common reasons for winning quotes
  - Frequent rejection reasons and improvement areas
  - Homeowner preference trends over time
- **Communication Impact**:
  - Response time correlation with success rates
  - Quality of proposal presentation impact
  - Follow-up communication effectiveness

#### 4.9.1 Lead Discovery Dashboard

- **Lead Marketplace View**: Grid/list view of available leads matching builder criteria
- **Filtering & Search**: Filter by project type, budget range, timeline, distance
- **Lead Preview Cards**: Limited information display to protect homeowner privacy
- **Matching Score**: Algorithm-based compatibility rating for each lead

#### 4.9.2 Privacy-Protected Lead Preview

- **Limited Information Display**:
  - Project type and general description
  - Timeline and urgency level
  - General area (e.g., "North London", "Manchester City Centre")
  - Project complexity and requirements overview
- **Hidden Information** (until purchase):
  - Exact property address
  - Homeowner contact details
  - Specific property photos or documents
  - Detailed project specifications
  - Homeowner's name and personal information
  - Budget information (never visible to builders)

#### 4.9.3 Lead Purchase Flow

- **Interest Declaration**: Builder expresses interest in specific lead
- **Payment Processing**: Secure payment for lead access (amount TBD by admin)
- **Purchase Confirmation**: Immediate confirmation and receipt
- **Full Details Unlock**: Complete project information becomes available
- **Contact Information**: Homeowner's contact details for direct communication

#### 4.9.4 Lead Management Interface

- **Purchased Leads Dashboard**: All leads builder has purchased
- **Lead Status Tracking**: Track communication and quote submission status
- **ROI Analytics**: Conversion rates and success metrics per lead
- **Communication History**: Record of interactions with homeowners
- **Quote Submission**: Direct quote submission for purchased leads

#### 4.9.5 Payment & Billing System

- **Credit System**: Pre-purchase credits for quick lead acquisition
- **Pay-per-Lead**: Individual lead purchases with instant payment
- **Subscription Tiers**: Monthly/annual plans with included lead credits
- **Billing History**: Complete transaction history and receipts
- **Refund Policy**: Quality guarantee and refund conditions

#### 4.8.1 Analytics Dashboard

- **Real-time Metrics**: Live platform statistics and performance indicators
- **Business Intelligence**: Advanced reporting and data visualization
- **User Behavior Analysis**: Detailed user journey and conversion tracking
- **Financial Analytics**: Revenue, costs, and profitability analysis
- **Geographic Analytics**: Regional performance and market penetration

#### 4.8.2 AI Model Management

- **Provider Configuration**: Switch between OpenAI, Anthropic, AWS Bedrock, Google
- **Model Parameters**: Temperature, max tokens, response format configuration
- **A/B Testing Framework**: Compare model performance and user satisfaction
- **Cost Optimization**: Monitor and optimize AI usage costs
- **Quality Assurance**: Automated testing of AI-generated content

#### 4.8.7 LLM Prompt File Organization

- **Separated Prompt Files**: Each prompt stored in individual files for maintainability
- **Prompt Directory Structure**: Organized folder structure for different prompt categories
- **File Naming Convention**: Consistent naming for easy identification and management
- **Version Control**: Individual file tracking for prompt changes
- **Code Separation**: Clean separation between business logic and prompt content
- **Import System**: Centralized prompt loading and management system

#### 4.8.6 AI Questionnaire Controls

- **Question Limit Configuration**:
  - Set maximum questions per project type (5-50 range)
  - Global maximum question override (emergency brake)
  - Progressive question limits based on project complexity
  - Question budget allocation by SoW section importance
- **Question Quality Controls**:
  - Minimum question relevance score threshold
  - Duplicate question detection and prevention
  - Question complexity scoring and balancing
  - User fatigue detection and adaptive questioning
- **Performance Optimization**:
  - Question generation timeout limits
  - Fallback to essential questions if AI fails
  - Question caching for similar project types
  - Real-time question effectiveness tracking

#### 4.8.3 Payment System Administration

- **Multi-Provider Management**: Stripe, PayPal, bank transfers, cryptocurrency
- **Fee Structure Control**: Dynamic pricing and commission management
- **Transaction Monitoring**: Real-time payment processing and fraud detection
- **Dispute Resolution**: Automated and manual dispute handling
- **Compliance Management**: PCI DSS, GDPR, and financial regulation compliance

#### 4.8.4 Platform Configuration

- **Feature Flag Management**: Gradual rollout and A/B testing of new features
- **Regional Settings**: Localization and region-specific configurations
- **Compliance Updates**: Building regulations and legal requirement updates
- **Emergency Controls**: System maintenance mode and emergency shutdowns
- **Integration Management**: Third-party API configurations and monitoring

#### 4.8.5 SoW Monetization Controls

- **Charging Point Configuration**:
  - Toggle between "Free SoW" and "Paid SoW" modes
  - Set charging trigger: "Before Generation" or "After Preview"
  - Configure SoW pricing (£0-£500 range)
  - Enable/disable preview mode with section limits
- **Preview Settings**:
  - Set number of free preview sections (0-10)
  - Configure preview content depth (summary vs full content)
  - Customize preview watermarks and restrictions
  - A/B testing different preview lengths
- **Payment Integration**:
  - Multiple payment gateways (Stripe, PayPal, bank transfer)
  - Subscription vs one-time payment options
  - Discount codes and promotional pricing
  - Refund policy configuration
- **User Experience Controls**:
  - Customize payment page messaging and design
  - Configure upgrade prompts and timing
  - Set trial periods and grace periods
  - Manage payment failure handling

### 4.9 Planning Permission Data Mining System

#### 4.9.1 Council Website Data Extraction

- **Automated Scraping**: Extract planning application data from UK council websites
- **Application Monitoring**: Track new planning submissions and approvals
- **Data Standardization**: Normalize data across different council website formats
- **Compliance Monitoring**: Ensure scraping adheres to robots.txt and rate limits

#### 4.9.2 Homeowner Contact Identification

- **Applicant Data Extraction**: Identify homeowner/applicant contact information from planning applications
- **Address Matching**: Link planning applications to property addresses
- **Contact Validation**: Verify and clean extracted contact information
- **Duplicate Detection**: Prevent duplicate entries in prospect database

#### 4.9.3 Marketing Lead Generation

- **Prospect Database**: Secure storage of extracted planning data with GDPR compliance
- **Targeted Campaigns**: Marketing campaigns to homeowners with active planning applications
- **Segmentation**: Categorize prospects by project type, location, and planning stage
- **Conversion Tracking**: Monitor campaign effectiveness and lead conversion rates

#### 4.9.4 Data Protection & Compliance

- **GDPR Compliance**: Full compliance with data protection regulations
- **Opt-out Mechanisms**: Easy unsubscribe and data removal options
- **Data Retention**: Configurable retention policies for prospect data
- **Consent Management**: Track and manage marketing consent preferences

### 4.16 Multi-Agent AI System

#### 4.16.1 Specialized Trade Agents with UK Compliance

##### **Plumbing Agent**

- **Building Regulations**: Part G (Sanitation, hot water safety and water efficiency), Part H (Drainage and waste disposal)
- **Standards**: BS EN 806 (Water supply systems), BS 5572 (Sanitary pipework), Water Supply Regulations 2016
- **Certifications**: Gas Safe Register, WRAS (Water Regulations Advisory Scheme), CIPHE standards
- **Specialization**: Water systems, drainage, boiler installations, pipe routing, water pressure calculations, legionella prevention

##### **Electrical Agent**

- **Building Regulations**: Part P (Electrical safety), Part B (Fire safety - electrical installations)
- **Standards**: BS 7671 (IET Wiring Regulations), BS 5839 (Fire detection systems), BS EN 62305 (Lightning protection)
- **Certifications**: NICEIC, NAPIT, ECA, Part P compliance, 18th Edition requirements
- **Specialization**: Wiring, lighting design, power distribution, RCD protection, smart home integration, EV charging points

##### **HVAC Agent**

- **Building Regulations**: Part F (Ventilation), Part L (Conservation of fuel and power), Part J (Combustion appliances)
- **Standards**: BS EN 12831 (Heating systems), BS 5925 (Ventilation), F-Gas Regulations 2015
- **Certifications**: Gas Safe Register, REFCOM (refrigerant handling), HETAS (solid fuel), MCS (renewable energy)
- **Specialization**: Heating, ventilation, air conditioning, heat pumps, renewable energy systems, SAP calculations

##### **Structural Agent**

- **Building Regulations**: Part A (Structure), Part B (Fire safety - structural), Approved Document A
- **Standards**: BS EN 1990-1999 (Eurocodes), BS 5950 (Steel structures), BS 8110 (Concrete structures)
- **Certifications**: ICE (Institution of Civil Engineers), IStructE membership, CDM compliance
- **Specialization**: Load-bearing calculations, foundations, steel work, structural modifications, party wall considerations

##### **Roofing Agent**

- **Building Regulations**: Part C (Site preparation and resistance to contaminants), Part H (Drainage), Part L (Thermal performance)
- **Standards**: BS 5534 (Slating and tiling), BS 8217 (Flat roofs), BS 6229 (Flat roofs with continuously supported coverings)
- **Certifications**: NFRC (National Federation of Roofing Contractors), Competent Person Scheme
- **Specialization**: Roof structures, waterproofing, thermal performance, solar integration, guttering systems

##### **Flooring Agent**

- **Building Regulations**: Part E (Resistance to sound), Part C (Site preparation), Part F (Ventilation - suspended floors)
- **Standards**: BS 8203 (Resilient floor coverings), BS 5325 (Wood flooring), BS EN 13813 (Screed materials)
- **Certifications**: NICF (National Institute of Carpet and Floorlayers), CFA (Contract Flooring Association)
- **Specialization**: Floor construction, acoustic performance, underfloor heating, moisture control, accessibility

##### **Insulation Agent**

- **Building Regulations**: Part L (Conservation of fuel and power), Part C (Site preparation), Part F (Ventilation)
- **Standards**: BS 5803 (Thermal insulation), BS EN 13162-13171 (Insulation products), BRE standards
- **Certifications**: CIGA (Cavity Insulation Guarantee Agency), BBA (British Board of Agrément)
- **Specialization**: Thermal efficiency, sound proofing, cavity wall insulation, loft insulation, external wall insulation

##### **Glazing Agent**

- **Building Regulations**: Part L (Energy efficiency), Part N (Glazing safety), Part Q (Security)
- **Standards**: BS EN 14351 (Windows and doors), BS 6262 (Glazing for buildings), PAS 24 (Security)
- **Certifications**: FENSA, CERTASS, GGF (Glass and Glazing Federation), Secured by Design
- **Specialization**: Window performance, energy ratings, security features, acoustic glazing, building-integrated photovoltaics

##### **Exterior Agent**

- **Building Regulations**: Part C (Weather resistance), Part L (Thermal bridging), Part B (Fire safety - external walls)
- **Standards**: BS 8000-8 (External rendering), BS EN 13499 (External thermal insulation), BS 8414 (Fire testing)
- **Certifications**: EOTA (European Organisation for Technical Assessment), BBA certification
- **Specialization**: Cladding systems, rendering, brickwork, weatherproofing, external insulation, fire safety compliance

##### **Landscaping Agent**

- **Building Regulations**: Part H (Surface water drainage), Part C (Ground conditions)
- **Standards**: BS 3998 (Tree work), BS 7370 (Grounds maintenance), SUDS Manual
- **Certifications**: APL (Association of Professional Landscapers), RHS qualifications, LANTRA awards
- **Specialization**: Garden design, drainage systems, outdoor electrical, paving, boundary treatments, sustainable drainage

#### 4.16.2 Room-Specific Specialist Agents with UK Compliance

##### **Kitchen Agent**

- **Building Regulations**: Part G (Water efficiency), Part F (Ventilation), Part P (Electrical), Part B (Fire safety)
- **Standards**: BS EN 14749 (Kitchen furniture), BS 6222 (Domestic kitchen equipment), Gas Safety Regulations
- **Certifications**: KBSA (Kitchen Bathroom Bedroom Specialists Association), Gas Safe for appliances
- **Specialization**: Layout optimization, appliance integration, extraction systems, accessibility compliance

##### **Bathroom Agent**

- **Building Regulations**: Part G (Sanitation), Part C (Waterproofing), Part F (Ventilation), Part M (Accessibility)
- **Standards**: BS 5385 (Wall tiling), BS 8000-11 (Waterproofing), BS EN 274 (Sanitary appliances)
- **Certifications**: BMA (Bathroom Manufacturers Association), WRAS approval for fittings
- **Specialization**: Wet room design, waterproofing, accessibility, ventilation, heating systems

##### **Bedroom Agent**

- **Building Regulations**: Part E (Sound insulation), Part F (Ventilation), Part L (Energy efficiency), Part M (Accessibility)
- **Standards**: BS 8233 (Sound insulation), BS EN 15251 (Indoor environmental criteria)
- **Certifications**: Bedroom tax compliance, HMO licensing requirements where applicable
- **Specialization**: Layout optimization, storage solutions, lighting design, sound insulation, accessibility features

##### **Living Room Agent**

- **Building Regulations**: Part E (Acoustics), Part F (Ventilation), Part L (Energy efficiency), Part P (Electrical)
- **Standards**: BS 8233 (Sound insulation), BS EN 12354 (Acoustic performance), BS 5588 (Fire precautions)
- **Certifications**: Home entertainment system standards, smart home integration
- **Specialization**: Layout design, lighting systems, heating optimization, entertainment integration, acoustic design

##### **Loft Conversion Agent**

- **Building Regulations**: Part A (Structure), Part B (Fire safety/escape), Part C (Insulation), Part K (Stairs), Part L (Energy)
- **Standards**: BS 5268 (Timber structures), BS 8103 (Structural design), Building Regulations Approved Documents
- **Planning**: Permitted Development Rights, Planning Permission requirements, Conservation Area restrictions
- **Specialization**: Structural modifications, fire escape routes, insulation, building control applications

##### **Basement Agent**

- **Building Regulations**: Part C (Waterproofing), Part F (Ventilation), Part A (Structure), Part B (Fire safety)
- **Standards**: BS 8102 (Waterproofing), BS 8004 (Foundations), BS EN 1997 (Geotechnical design)
- **Certifications**: Structural waterproofing specialists, tanking system approvals
- **Specialization**: Waterproofing systems, structural underpinning, ventilation, lighting, building control compliance

##### **Garage Conversion Agent**

- **Building Regulations**: Part L (Insulation), Part F (Ventilation), Part P (Electrical), Part A (Structure if modifications)
- **Standards**: Building control requirements for change of use, thermal performance standards
- **Planning**: Permitted development assessment, planning permission requirements
- **Specialization**: Insulation upgrade, heating systems, electrical upgrade, building regulations compliance

##### **Extension Agent**

- **Building Regulations**: All parts applicable, particularly Part A (Structure), Part L (Energy), Part M (Access)
- **Planning**: Town and Country Planning Act, Permitted Development, Planning Permission, CIL charges
- **Standards**: Complete building regulations compliance, Party Wall Act 1996, CDM Regulations 2015
- **Specialization**: Foundation design, structural integration, planning applications, building control liaison

#### 4.16.3 Regulatory & Compliance Agents with UK Standards

##### **Building Regulations Agent**

- **Primary Focus**: Building Regulations 2010, Approved Documents A-P, Building Act 1984
- **Standards**: All relevant British Standards (BS), European Standards (BS EN), Building Control procedures
- **Certifications**: Building Control Officer standards, LABC (Local Authority Building Control)
- **Specialization**: Compliance checking, application procedures, inspection scheduling, certificate issuance

##### **Planning Permission Agent**

- **Regulations**: Town and Country Planning Act 1990, NPPF (National Planning Policy Framework)
- **Standards**: Permitted Development Order 2015, Use Classes Order, Conservation Area guidelines
- **Specialization**: Planning applications, permitted development assessment, conservation compliance, listed building consent

##### **Health & Safety Agent**

- **Regulations**: CDM Regulations 2015, HASAWA 1974, COSHH Regulations 2002
- **Standards**: HSE guidance documents, BS OHSAS 18001, Construction (Design and Management) Regulations
- **Certifications**: NEBOSH, IOSH, CITB safety standards
- **Specialization**: Risk assessments, method statements, site safety, CDM compliance

##### **Energy Efficiency Agent**

- **Regulations**: Building Regulations Part L, Energy Performance of Buildings Regulations 2012
- **Standards**: SAP (Standard Assessment Procedure), SBEM (Simplified Building Energy Model), RdSAP
- **Certifications**: STROMA, ELMHURST, BRE accreditation for energy assessments
- **Specialization**: EPC calculations, renewable energy compliance, thermal bridging, airtightness

##### **Accessibility Agent**

- **Regulations**: Building Regulations Part M, Equality Act 2010, Disability Discrimination Act
- **Standards**: BS 8300 (Accessible design), BS 9999 (Accessible means of escape)
- **Certifications**: Access auditor qualifications, disability access consultancy
- **Specialization**: Accessible design, mobility considerations, future-proofing, universal design principles

##### **Fire Safety Agent**

- **Regulations**: Building Regulations Part B, Fire Safety Order 2005, Fire Safety Act 2021
- **Standards**: BS 9999 (Fire safety code), BS EN 54 (Fire detection), BS 5839 (Fire alarm systems)
- **Certifications**: FIA (Fire Industry Association), BAFE (British Approvals for Fire Equipment)
- **Specialization**: Fire risk assessments, escape route design, fire-resistant construction, alarm systems

##### **Environmental Agent**

- **Regulations**: Environmental Protection Act 1990, Climate Change Act 2008, Waste Regulations
- **Standards**: BREEAM, Code for Sustainable Homes, BRE Environmental Assessment Method
- **Certifications**: BREEAM Assessor, Passivhaus certification, environmental management systems
- **Specialization**: Sustainability assessment, eco-friendly materials, waste management, carbon footprint reduction

#### 4.16.4 Project Management & Coordination Agents

##### **Project Sequencing Agent**

- **Standards**: PRINCE2, APM (Association for Project Management), BS 6079 (Project management)
- **Certifications**: APM qualifications, PRINCE2 certification, construction project management
- **Specialization**: Work scheduling, trade coordination, critical path analysis, resource optimization

##### **Cost Estimation Agent**

- **Standards**: RICS (Royal Institution of Chartered Surveyors) standards, NRM (New Rules of Measurement)
- **Certifications**: RICS quantity surveying, cost management qualifications
- **Specialization**: Detailed cost analysis, value engineering, budget optimization, market rate analysis

##### **Procurement Agent**

- **Standards**: BS EN ISO 9001 (Quality management), Construction procurement guidelines
- **Certifications**: CIPS (Chartered Institute of Procurement & Supply), construction procurement
- **Specialization**: Supplier selection, material sourcing, delivery coordination, quality assurance

##### **Quality Control Agent**

- **Standards**: BS EN ISO 9001, NHBC standards, CQP (Construction Quality Plan)
- **Certifications**: Quality management systems, construction quality assurance
- **Specialization**: Quality planning, inspection schedules, defect prevention, standards compliance

##### **Risk Assessment Agent**

- **Standards**: BS 31000 (Risk management), CDM Regulations, HSE guidance
- **Certifications**: Risk management qualifications, construction risk assessment
- **Specialization**: Risk identification, mitigation strategies, contingency planning, insurance requirements

##### **Documentation Agent**

- **Standards**: BS 1192 (Construction information), BIM standards, document control procedures
- **Certifications**: Information management, BIM coordination, document control systems
- **Specialization**: Document management, certification tracking, handover documentation, warranty management

#### 4.16.5 Agent Interaction Framework & Workflow Examples

##### **Hierarchical Coordination**

- **Master Orchestrator Agent**: Coordinates all other agents, manages workflow, resolves conflicts
- **Trade Coordinators**: Senior agents that manage related trades (e.g., Wet Trades Coordinator for plumbing/tiling)
- **Room Coordinators**: Manage all trades working in specific rooms
- **Compliance Coordinators**: Ensure all regulatory requirements are met across trades

##### **Cross-Agent Communication Protocols**

- **Dependency Mapping**: Agents understand which other agents they depend on
- **Information Sharing**: Structured data exchange between related agents
- **Conflict Resolution**: Automated and escalated conflict resolution processes
- **Validation Chains**: Agents validate each other's recommendations
- **Knowledge Synthesis**: Combine insights from multiple agents for comprehensive solutions

##### **Collaboration Patterns**

```
Kitchen Agent → Plumbing Agent → Electrical Agent → HVAC Agent
     ↓              ↓               ↓              ↓
Building Regs Agent ← Quality Control Agent → Cost Agent
     ↓                      ↓                    ↓
Master Orchestrator Agent ← Risk Assessment Agent
```

##### **Comprehensive Agent Workflow Examples**

**Kitchen Renovation Multi-Agent Workflow:**

1. **Kitchen Agent** analyzes layout, workflow triangle, and appliance requirements
2. **Plumbing Agent** reviews water supply capacity, waste routing, and boiler integration
3. **Electrical Agent** designs circuits for appliances, lighting zones, and smart home integration
4. **HVAC Agent** calculates extraction requirements, heating zones, and ventilation rates
5. **Building Regulations Agent** validates Part G (water efficiency), Part F (ventilation), Part P (electrical)
6. **Structural Agent** assesses load-bearing walls for potential removal or modification
7. **Cost Estimation Agent** provides detailed breakdown including appliances, labor, and materials
8. **Project Sequencing Agent** creates timeline coordinating trades and appliance deliveries
9. **Master Orchestrator** synthesizes all inputs into comprehensive SoW with dependencies

**Bathroom Renovation Multi-Agent Workflow:**

1. **Bathroom Agent** designs layout considering accessibility and water efficiency
2. **Plumbing Agent** plans new pipe routes, pressure requirements, and waste connections
3. **Electrical Agent** designs lighting, ventilation, and heated towel rail circuits
4. **HVAC Agent** calculates ventilation rates and heating requirements
5. **Insulation Agent** specifies thermal and acoustic insulation requirements
6. **Glazing Agent** recommends privacy glass and ventilation windows
7. **Building Regulations Agent** ensures Part G (sanitation), Part C (waterproofing), Part F (ventilation) compliance
8. **Accessibility Agent** reviews Part M compliance and future-proofing options
9. **Quality Control Agent** specifies waterproofing standards and testing procedures
10. **Master Orchestrator** creates integrated plan with critical waterproofing sequences

**Loft Conversion Multi-Agent Workflow:**

1. **Loft Conversion Agent** assesses structural feasibility and headroom requirements
2. **Structural Agent** designs roof reinforcement, floor joists, and load calculations
3. **Planning Permission Agent** determines if planning permission or permitted development applies
4. **Building Regulations Agent** reviews Part A (structure), Part B (fire escape), Part K (stairs), Part L (insulation)
5. **Insulation Agent** specifies thermal performance to meet current standards
6. **Electrical Agent** designs new circuits, lighting, and power distribution
7. **HVAC Agent** extends heating system and ensures adequate ventilation
8. **Fire Safety Agent** designs compliant escape routes and fire detection systems
9. **Glazing Agent** specifies roof windows and dormers for natural light
10. **Cost Estimation Agent** provides detailed costs including structural work and finishes
11. **Project Sequencing Agent** coordinates structural work, building control inspections, and fit-out
12. **Master Orchestrator** ensures all regulatory approvals before work commences

**Two-Story Extension Multi-Agent Workflow:**

1. **Extension Agent** analyzes site constraints, design requirements, and integration with existing structure
2. **Planning Permission Agent** prepares planning application, neighbor consultation, and design compliance
3. **Structural Agent** designs foundations, frame, and connection to existing building
4. **Building Regulations Agent** ensures compliance across all parts, particularly Part A, L, M
5. **Plumbing Agent** extends water supply, heating, and drainage systems
6. **Electrical Agent** designs new consumer unit, circuits, and integration with existing systems
7. **HVAC Agent** extends heating system, designs ventilation, and optimizes energy efficiency
8. **Insulation Agent** specifies thermal bridging solutions and continuous insulation
9. **Glazing Agent** designs window and door schedule with energy performance calculations
10. **Roofing Agent** designs roof structure, waterproofing, and integration with existing roof
11. **Energy Efficiency Agent** calculates SAP ratings and renewable energy requirements
12. **Risk Assessment Agent** identifies construction risks, party wall requirements, and insurance needs
13. **Cost Estimation Agent** provides phased cost breakdown with contingencies
14. **Project Sequencing Agent** creates detailed program coordinating all trades and inspections
15. **Master Orchestrator** manages complex dependencies and regulatory approval sequences

**Basement Conversion Multi-Agent Workflow:**

1. **Basement Agent** assesses existing conditions, headroom, and conversion feasibility
2. **Structural Agent** designs underpinning, structural alterations, and load calculations
3. **Building Regulations Agent** reviews Part C (waterproofing), Part F (ventilation), Part B (fire safety)
4. **Plumbing Agent** designs drainage, pumping systems, and water supply extensions
5. **Electrical Agent** designs lighting, power, and emergency lighting systems
6. **HVAC Agent** designs mechanical ventilation, heating, and dehumidification
7. **Insulation Agent** specifies thermal and acoustic insulation for below-ground conditions
8. **Fire Safety Agent** designs escape routes, fire detection, and emergency lighting
9. **Health & Safety Agent** assesses excavation risks, confined space procedures, and CDM requirements
10. **Environmental Agent** addresses radon protection, ground gas, and contamination issues
11. **Quality Control Agent** specifies waterproofing testing and structural monitoring
12. **Cost Estimation Agent** includes specialist basement construction costs and equipment
13. **Risk Assessment Agent** identifies ground conditions, neighbor impact, and structural risks
14. **Master Orchestrator** coordinates complex below-ground construction sequence

**Whole House Renovation Multi-Agent Workflow:**

1. **Master Orchestrator** initiates comprehensive property assessment across all agents
2. **Structural Agent** surveys existing structure, identifies defects, and plans improvements
3. **Building Regulations Agent** reviews current compliance and identifies upgrade requirements
4. **Energy Efficiency Agent** conducts thermal survey and designs efficiency improvements
5. **Electrical Agent** surveys existing installation and designs complete rewiring
6. **Plumbing Agent** assesses existing systems and designs modern replacements
7. **HVAC Agent** designs integrated heating, ventilation, and renewable energy systems
8. **Insulation Agent** specifies whole-house insulation strategy
9. **Multiple Room Agents** (Kitchen, Bathroom, Bedroom, Living Room) design individual spaces
10. **Glazing Agent** specifies window and door replacements with energy performance
11. **Roofing Agent** assesses roof condition and specifies repairs or replacement
12. **Fire Safety Agent** designs updated fire safety systems throughout
13. **Accessibility Agent** incorporates universal design principles
14. **Environmental Agent** specifies sustainable materials and waste management
15. **Cost Estimation Agent** provides detailed whole-house renovation budget
16. **Project Sequencing Agent** creates phased approach to minimize disruption
17. **Quality Control Agent** establishes quality standards and inspection schedules
18. **Risk Assessment Agent** identifies project-wide risks and mitigation strategies
19. **Master Orchestrator** synthesizes all inputs into comprehensive renovation strategy

**HVAC System Upgrade Multi-Agent Workflow:**

1. **HVAC Agent** conducts heat loss calculations and system sizing
2. **Energy Efficiency Agent** analyzes current performance and improvement opportunities
3. **Electrical Agent** designs power supply for new equipment and controls
4. **Plumbing Agent** designs heating circuits, hot water integration, and drainage
5. **Structural Agent** assesses structural requirements for equipment mounting
6. **Building Regulations Agent** ensures Part F (ventilation), Part J (combustion), Part L (energy) compliance
7. **Environmental Agent** specifies renewable energy integration and refrigerant regulations
8. **Cost Estimation Agent** provides equipment, installation, and running cost analysis
9. **Project Sequencing Agent** coordinates installation with minimal disruption
10. **Quality Control Agent** specifies commissioning procedures and performance testing
11. **Master Orchestrator** ensures integrated approach with existing building systems

**Accessibility Retrofit Multi-Agent Workflow:**

1. **Accessibility Agent** conducts comprehensive accessibility audit and user needs assessment
2. **Structural Agent** assesses feasibility of ramps, lifts, and structural modifications
3. **Building Regulations Agent** ensures Part M compliance and building control approval
4. **Electrical Agent** designs accessible lighting, power outlets, and door entry systems
5. **Plumbing Agent** specifies accessible bathroom fixtures and controls
6. **Glazing Agent** designs accessible window and door hardware
7. **Flooring Agent** specifies slip-resistant, level access flooring solutions
8. **HVAC Agent** ensures accessible heating and ventilation controls
9. **Cost Estimation Agent** provides costs including grants and funding opportunities
10. **Quality Control Agent** ensures all modifications meet accessibility standards
11. **Master Orchestrator** coordinates comprehensive accessibility improvements

**Energy Efficiency Upgrade Multi-Agent Workflow:**

1. **Energy Efficiency Agent** conducts comprehensive energy audit and SAP assessment
2. **Insulation Agent** specifies wall, roof, and floor insulation improvements
3. **Glazing Agent** recommends window and door upgrades for thermal performance
4. **HVAC Agent** designs efficient heating system and renewable energy integration
5. **Electrical Agent** designs smart controls, LED lighting, and EV charging points
6. **Building Regulations Agent** ensures Part L compliance and building control approval
7. **Environmental Agent** specifies sustainable materials and carbon reduction measures
8. **Cost Estimation Agent** provides costs including government grants and incentives
9. **Project Sequencing Agent** optimizes installation sequence for minimal disruption
10. **Quality Control Agent** specifies testing and commissioning procedures
11. **Master Orchestrator** ensures integrated approach to achieve target energy ratings

### 4.15 Party Wall Agreement System

#### 4.15.1 Admin Template Management

- **Template Upload Interface**: Upload party wall agreement templates (PDF/Word formats)
- **Template Versioning**: Manage multiple versions of agreement templates
- **Template Categories**: Different templates for different wall types (shared walls, boundary walls, excavation)
- **Template Customization**: Admin can modify standard clauses and terms
- **Legal Compliance**: Ensure templates comply with Party Wall etc. Act 1996

#### 4.15.2 Homeowner Agreement Creation

- **Template Selection**: Choose appropriate template based on project type
- **Auto-Population**: Fill template with project and property details
- **Neighbor Identification**: Add neighbor contact details and affected properties
- **Document Generation**: Create personalized party wall agreement
- **Preview & Edit**: Review agreement before sending to neighbors

#### 4.15.3 Neighbor Notification & Approval System

- **Automated Delivery**: Email/postal delivery of agreements to neighbors
- **Digital Response Portal**: Secure link for neighbor to review and respond
- **Response Options**: Approve, reject, or request modifications
- **Timeline Tracking**: Monitor statutory notice periods and deadlines
- **Reminder System**: Automated follow-ups for pending responses

#### 4.15.4 Agreement Status Management

- **Status Dashboard**: Track all party wall agreements and their status
- **Document Storage**: Secure storage of signed agreements and responses
- **Audit Trail**: Complete history of agreement process
- **Legal Documentation**: Generate statutory notices and formal documentation

#### 4.14.1 Admin Portal Batch Process Configuration

- **Crawler Management Interface**: Super admin portal for configuring and managing batch crawling processes
- **Website URL Management**: Add, edit, and remove planning application website URLs for crawling
- **Crawling Schedule**: Configure automated batch processes (daily, weekly, monthly)
- **Manual Trigger**: On-demand batch process initiation by super admin
- **Progress Monitoring**: Real-time status of ongoing crawling operations

#### 4.14.2 Planning Website Crawler Engine

- **Multi-Site Support**: Crawl multiple council planning websites simultaneously
- **Adaptive Parsing**: Handle different website structures and formats across councils
- **Data Extraction**: Extract application address and applicant name from planning applications
- **Rate Limiting**: Respect website rate limits and robots.txt files
- **Error Handling**: Robust error handling for failed requests and parsing errors
- **Duplicate Detection**: Prevent duplicate entries in the database

#### 4.14.3 Extracted Data Management

- **Planning Applications Table**: New database table for storing extracted planning data
- **Data Structure**: Store application ID, address, applicant name, council, extraction date
- **Data Validation**: Validate extracted addresses and clean applicant names
- **Status Tracking**: Track processing status of each extracted application
- **Export Functionality**: Export extracted data for marketing campaigns

#### 4.14.4 Batch Process Monitoring

- **Crawling Dashboard**: Real-time monitoring of batch processes
- **Success Metrics**: Track successful extractions vs. failed attempts
- **Error Logging**: Detailed logs of crawling errors and failures
- **Performance Analytics**: Crawling speed and efficiency metrics
- **Alert System**: Notifications for failed crawls or system issues

### 4.10 Mandatory Face-to-Face Meeting & Contract Generation

#### 4.10.1 Pre-Contract Meeting Requirement

- **Meeting Mandate**: Contract generation only after confirmed face-to-face meeting
- **Property Visit Confirmation**: Builder must confirm they have visited the property
- **Homeowner Meeting Confirmation**: Homeowner must confirm meeting occurred with specific date
- **Dual Verification**: Both parties must independently confirm the meeting

#### 4.10.2 Meeting Verification Process

- **Date Capture**: Homeowner provides specific meeting date
- **Builder Confirmation**: Builder confirms property visit and homeowner meeting
- **Verification Workflow**: System validates both confirmations before enabling contract generation
- **Meeting Documentation**: Record meeting details in project audit trail

#### 4.10.3 Contract Integration

- **Meeting Reference**: Contract includes statement referencing the in-person meeting date
- **Legal Clause**: "Based upon the in-person meeting dated [DATE] both parties agree..."
- **Verification Record**: Contract references that both parties confirmed the meeting
- **Audit Trail**: Complete record of meeting verification process

#### 4.10.4 Platform Liability Disclaimer

- **Contract Generation Disclaimer**: Platform takes no responsibility after contract generation
- **Performance Disclaimer**: Not responsible for homeowner or builder non-delivery
- **Terms & Conditions**: Clear liability limitations in website T&Cs
- **Legal Protection**: Platform role limited to facilitation and document generation

### 4.6 Property Assessment & Compliance

#### 4.6.1 Address Autocomplete & Validation

- **GetAddress.io Integration**: Real-time address autocomplete using GetAddress.io free service
- **JavaScript Autocomplete**: Implement GetAddress.io JavaScript autocomplete as homeowner types
- **Auto-Population**: Automatically populate line1, line2, city, postcode fields from selected address
- **Address Verification**: Validate address exists and is correctly formatted
- **Council Data Integration**: Retrieve local authority information from validated address
- **Planning Restrictions**: Identify conservation areas and listed buildings
- **Automated Compliance**: Check against local planning policies

#### 4.6.2 Building Regulations Integration

- **Regulation Mapping**: Link project types to relevant regulations
- **Compliance Checklist**: Automated requirement identification
- **Planning Permission**: Determine if permission is required
- **Building Control**: Identify notification requirements

## 5. Technical Implementation Details

### 5.1 API Endpoints Structure

#### 5.1.1 Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/confirm` - Email confirmation
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset completion

#### 5.1.2 Project Management Endpoints

- `GET /projects` - List user projects (filtered by user)
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `POST /projects/{id}/documents` - Upload documents with duplicate detection
- `POST /projects/{id}/documents/check-duplicate` - Pre-upload duplicate check
- `DELETE /projects/{id}/documents/{docId}` - Delete document
- `GET /projects/{id}/documents` - List all project documents with MD5 hashes

#### 5.1.3 Questionnaire Endpoints

- `POST /questionnaire/start` - Initialize questionnaire session
- `POST /questionnaire/answer` - Submit answer and get next question
- `POST /questionnaire/{sessionId}/documents` - Upload documents for specific question
- `POST /questionnaire/{sessionId}/documents/check-duplicate` - Check for duplicates before upload
- `GET /questionnaire/{sessionId}` - Get session status
- `PUT /questionnaire/{sessionId}/complete` - Mark questionnaire complete

#### 5.1.4 SoW Generation Endpoints

- `POST /sow/generate` - Generate SoW from questionnaire
- `GET /sow/{sowId}` - Retrieve generated SoW
- `PUT /sow/{sowId}` - Update SoW content
- `POST /sow/{sowId}/export` - Export SoW as PDF
- `GET /sow/{sowId}/gantt` - Get Gantt chart data for SoW timeline
- `POST /sow/{sowId}/gantt/export` - Export Gantt chart as PDF/image

#### 5.1.5 Builder Management Endpoints

- `POST /projects/{id}/invitations` - Generate builder invitation
- `POST /builder/register-with-code` - Builder registration with invitation
- `GET /builder/projects` - List accessible projects for builder
- `POST /projects/{id}/quotes` - Submit quote
- `GET /projects/{id}/quotes` - List project quotes (homeowner only)

#### 5.1.6 Hot Leads Marketplace Endpoints

- `GET /leads/available` - List available leads for builder (preview only, filtered by location/specialty)
- `GET /leads/{leadId}/preview` - Get lead preview details (limited information)
- `POST /leads/{leadId}/purchase` - Purchase lead access with payment processing
- `GET /leads/{leadId}/full-details` - Get complete lead details (after purchase)
- `GET /leads/purchased` - List builder's purchased leads with full details
- `POST /leads/{leadId}/contact` - Record homeowner contact attempt
- `POST /leads/{leadId}/quote` - Submit quote for purchased lead
- `POST /leads/{leadId}/feedback` - Submit lead quality feedback
- `GET /leads/analytics` - Lead performance analytics for builder

#### 5.1.7 System Administration Endpoints

- `GET /admin/analytics/dashboard` - Platform statistics and metrics
- `GET /admin/analytics/users` - User analytics and demographics
- `GET /admin/analytics/projects` - Project analytics and trends
- `GET /admin/analytics/financial` - Revenue and financial metrics
- `PUT /admin/config/ai-models` - Configure AI providers and models
- `GET /admin/config/ai-performance` - AI model performance metrics
- `PUT /admin/config/payments` - Configure payment providers
- `GET /admin/payments/transactions` - Transaction monitoring
- `PUT /admin/config/features` - Feature flag management
- `GET /admin/audit/logs` - System audit logs
- `POST /admin/users/{userId}/actions` - User management actions
- `GET /admin/leads/marketplace` - Hot leads marketplace management

#### 5.1.16 SoW Monetization Control Endpoints

- `GET /admin/sow/pricing-config` - Get current SoW pricing configuration
- `PUT /admin/sow/pricing-config` - Update SoW pricing and charging rules
- `GET /admin/sow/preview-settings` - Get SoW preview configuration
- `PUT /admin/sow/preview-settings` - Configure preview sections and restrictions
- `POST /admin/sow/pricing/test` - Test pricing configuration with sample data
- `GET /admin/sow/conversion-analytics` - SoW conversion and payment metrics
- `PUT /admin/sow/payment-gates` - Configure payment gateway settings
- `GET /admin/sow/ab-tests` - Manage A/B tests for pricing strategies

#### 5.1.17 AI Questionnaire Control Endpoints

- `GET /admin/ai/question-limits` - Get current question limit configuration
- `PUT /admin/ai/question-limits` - Update maximum question limits by project type
- `GET /admin/ai/question-analytics` - Question effectiveness and user completion metrics
- `POST /admin/ai/question-limits/test` - Test question limits with sample projects
- `GET /admin/ai/question-performance` - Track question quality and relevance scores
- `PUT /admin/ai/question-quality-thresholds` - Configure question quality controls

#### 5.1.18 Party Wall Agreement Endpoints

- `GET /admin/party-wall/templates` - List all party wall agreement templates
- `POST /admin/party-wall/templates` - Upload new party wall template
- `PUT /admin/party-wall/templates/{id}` - Update existing template
- `DELETE /admin/party-wall/templates/{id}` - Remove template
- `GET /admin/party-wall/agreements` - List all party wall agreements (admin view)
- `GET /projects/{projectId}/party-wall/templates` - Get available templates for project
- `POST /projects/{projectId}/party-wall/agreements` - Create party wall agreement
- `GET /projects/{projectId}/party-wall/agreements` - List project's party wall agreements
- `PUT /party-wall/agreements/{id}` - Update agreement details
- `POST /party-wall/agreements/{id}/send` - Send agreement to neighbors
- `GET /party-wall/agreements/{id}/status` - Get agreement status and responses
- `POST /party-wall/neighbor-response/{token}` - Neighbor response submission
- `GET /party-wall/neighbor-response/{token}` - Neighbor response portal

#### 5.1.8 Selection Feedback & Analytics Endpoints

- `POST /projects/{projectId}/select-builder` - Submit builder selection with feedback
- `GET /projects/{projectId}/selection-feedback` - Get selection feedback (homeowner)
- `POST /quotes/{quoteId}/feedback` - Submit detailed feedback on quote
- `GET /builder/analytics/performance` - Get builder performance analytics
- `GET /builder/analytics/feedback` - Get aggregated feedback and ratings
- `GET /builder/analytics/benchmarks` - Get market benchmarking data
- `GET /builder/analytics/recommendations` - Get AI-powered improvement suggestions

#### 5.1.9 Planning Permission Data Mining Endpoints

- `POST /admin/planning/scrape` - Initiate council website scraping
- `GET /admin/planning/prospects` - List extracted prospect data
- `POST /admin/planning/campaigns` - Create targeted marketing campaigns
- `GET /admin/planning/analytics` - Campaign performance and conversion metrics
- `POST /admin/planning/gdpr/opt-out` - Process GDPR opt-out requests

#### 5.1.10 Batch Crawler System Endpoints

- `POST /admin/crawler/websites` - Add new planning website URL for crawling
- `GET /admin/crawler/websites` - List all configured crawler websites
- `PUT /admin/crawler/websites/{id}` - Update website configuration
- `DELETE /admin/crawler/websites/{id}` - Remove website from crawler
- `POST /admin/crawler/batch/start` - Initiate manual batch crawling process
- `GET /admin/crawler/batch/status` - Get current batch process status
- `GET /admin/crawler/batch/history` - List previous batch process results
- `GET /admin/planning-applications` - List extracted planning applications
- `POST /admin/planning-applications/export` - Export planning data for campaigns
- `GET /admin/crawler/analytics` - Crawler performance and success metrics

#### 5.1.11 Face-to-Face Meeting & Contract Generation Endpoints

- `POST /projects/{projectId}/meeting/homeowner-confirm` - Homeowner confirms meeting date
- `POST /projects/{projectId}/meeting/builder-confirm` - Builder confirms property visit
- `GET /projects/{projectId}/meeting/status` - Check meeting verification status
- `POST /projects/{projectId}/contract/generate` - Generate contract after meeting verification
- `GET /projects/{projectId}/contract/status` - Check contract generation eligibility

#### 5.1.12 Address Autocomplete Endpoints

- `GET /address/autocomplete` - Proxy GetAddress.io autocomplete API
- `GET /address/lookup/{id}` - Get full address details from GetAddress.io ID
- `POST /address/validate` - Validate and standardize address format

### 5.2 Data Models

```typescript
interface Project {
  id: string;
  ownerId: string; // Cognito user ID
  propertyAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  projectType: string;
  status:
    | "details_collection"
    | "sow_generation"
    | "sow_ready"
    | "builders_invited"
    | "quotes_received"
    | "planning"
    | "in_progress"
    | "completed"
    | "on_hold";
  requirements: {
    description: string;
    dimensions?: { length?: number; width?: number; height?: number };
    materials?: string[];
    timeline?: string;
    specialRequirements?: string[];
  };
  documents: DocumentReference[];
  councilData?: CouncilData;
  sowId?: string;
  selectedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 5.2.2 Questionnaire Session Model

```typescript
interface QuestionnaireSession {
  id: string;
  projectId: string;
  currentQuestionIndex: number;
  responses: QuestionnaireResponse[];
  isComplete: boolean;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 5.2.3 Builder Invitation Model

```typescript
interface BuilderInvitation {
  id: string;
  projectId: string;
  code: string; // 8-character unique code
  email: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string; // 7 days from creation
  createdAt: string;
  usedAt?: string;
}
```

#### 5.2.4 Hot Lead Model

```typescript
interface HotLead {
  id: string;
  projectId: string;
  homeownerConsent: {
    granted: boolean;
    grantedAt: string;
    consentLevel: "basic" | "detailed" | "full";
  };
  previewDetails: {
    // Public information shown before purchase
    projectType: string;
    timeline: string;
    generalLocation: string; // e.g., "North London", "Manchester Centre"
    urgency: "low" | "medium" | "high";
    projectComplexity: "simple" | "moderate" | "complex";
    generalDescription: string; // Sanitized description
  };
  fullDetails: {
    // Private information shown after purchase
    exactAddress: {
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
    };
    homeownerContact: {
      name: string;
      email: string;
      phone: string;
    };
    detailedDescription: string;
    specificRequirements: string[];
    propertyPhotos: string[]; // S3 URLs
    documents: Array<{
      id: string;
      name: string;
      url: string;
    }>;
    sowId?: string;
  };
  targeting: {
    tier1Builders: string[]; // Similar work within region
    tier2Builders: string[]; // Any work within region
    specialtyRequired: string[];
    geographicRegion: string; // General region rather than precise distance
  };
  pricing: {
    tier1Price: number; // Premium for specialty match
    tier2Price: number; // Standard for general match
    dynamicPricing: boolean;
  };
  status: "active" | "sold" | "expired" | "withdrawn";
  purchasedBy: Array<{
    builderId: string;
    purchasedAt: string;
    pricePaid: number;
    tier: "tier1" | "tier2";
  }>;
  createdAt: string;
  expiresAt: string;
}
```

#### 5.2.7 Lead Purchase Model

```typescript
interface LeadPurchase {
  id: string;
  leadId: string;
  builderId: string;
  purchaseDetails: {
    pricePaid: number;
    tier: "tier1" | "tier2";
    paymentMethod: string;
    transactionId: string;
  };
  accessGranted: {
    fullDetailsUnlocked: boolean;
    unlockedAt: string;
    expiresAt?: string; // Optional expiry for lead access
  };
  engagement: {
    contactedHomeowner: boolean;
    quoteSubmitted: boolean;
    quoteAccepted?: boolean;
    projectAwarded?: boolean;
  };
  status: "active" | "contacted" | "quoted" | "won" | "lost" | "expired";
  createdAt: string;
  updatedAt: string;
}
```

#### 5.2.5 Builder Work History Model

```typescript
interface BuilderWorkHistory {
  id: string;
  builderId: string;
  projectType: string;
  location: {
    postcode: string;
    coordinates: { lat: number; lng: number };
  };
  completedAt: string;
  projectValue: number;
  clientRating: number;
  verified: boolean;
  specialties: string[];
}
```

#### 5.2.6 Admin Configuration Model

```typescript
interface AdminConfiguration {
  id: string;
  category:
    | "ai_models"
    | "payments"
    | "features"
    | "marketplace"
    | "sow_monetization"
    | "ai_questionnaire";
  settings: {
    aiModels?: {
      primaryProvider: "openai" | "anthropic" | "bedrock" | "google";
      modelConfig: {
        temperature: number;
        maxTokens: number;
        topP: number;
      };
      fallbackProviders: string[];
      costLimits: { daily: number; monthly: number };
    };
    aiQuestionnaire?: {
      questionLimits: {
        globalMaximum: number; // Emergency brake (e.g., 50)
        byProjectType: Record<string, number>; // e.g., {"kitchen_renovation": 25, "extension": 35}
        byComplexity: {
          simple: number; // e.g., 15 questions max
          moderate: number; // e.g., 25 questions max
          complex: number; // e.g., 40 questions max
        };
      };
      qualityControls: {
        minimumRelevanceScore: number; // 0-1 threshold
        duplicateDetectionEnabled: boolean;
        maxSimilarQuestions: number; // Prevent too many similar questions
        userFatigueThreshold: number; // Detect when user is getting tired
      };
      performanceSettings: {
        questionGenerationTimeoutMs: number;
        fallbackToEssentialQuestions: boolean;
        questionCachingEnabled: boolean;
        adaptiveQuestioningEnabled: boolean; // Reduce questions if user shows fatigue
      };
      analytics: {
        trackQuestionEffectiveness: boolean;
        trackUserCompletionRates: boolean;
        trackTimePerQuestion: boolean;
      };
    };
    payments?: {
      providers: Array<{
        name: string;
        enabled: boolean;
        config: Record<string, any>;
      }>;
      feeStructure: {
        platformFee: number;
        builderCommission: number;
        leadSaleCommission: number;
      };
    };
    features?: {
      flags: Record<string, boolean>;
      rolloutPercentage: Record<string, number>;
    };
    marketplace?: {
      leadPricing: {
        tier1Multiplier: number;
        tier2BasePrice: number;
        dynamicPricingEnabled: boolean;
      };
      qualityThresholds: {
        minimumProjectValue: number;
        maximumDistance: { tier1: number; tier2: number };
      };
    };
    sowMonetization?: {
      chargingEnabled: boolean;
      chargingPoint: "before_generation" | "after_preview" | "never";
      pricing: {
        basePrice: number;
        currency: "GBP";
        discountCodes: Array<{
          code: string;
          discountPercent: number;
          validUntil: string;
          usageLimit: number;
          usedCount: number;
        }>;
      };
      previewSettings: {
        enabled: boolean;
        freeSections: number; // Number of sections shown for free
        previewDepth: "summary" | "full_content" | "first_paragraph";
        watermarkEnabled: boolean;
        watermarkText: string;
        upgradePromptText: string;
      };
      paymentGateways: {
        stripe: { enabled: boolean; publicKey: string };
        paypal: { enabled: boolean; clientId: string };
        bankTransfer: { enabled: boolean; accountDetails: string };
      };
      abTesting: {
        enabled: boolean;
        variants: Array<{
          name: string;
          percentage: number;
          pricing: number;
          previewSections: number;
        }>;
      };
    };
  };
  updatedBy: string;
  updatedAt: string;
}
```

#### 5.2.8 Homeowner Selection Feedback Model

```typescript
interface SelectionFeedback {
  id: string;
  projectId: string;
  homeownerId: string;
  selectedQuoteId: string;
  rejectedQuoteIds: string[];
  selectionCriteria: {
    primaryFactors: Array<{
      factor:
        | "cost"
        | "timeline"
        | "reputation"
        | "payment_terms"
        | "communication"
        | "portfolio"
        | "certifications"
        | "warranty";
      importance: 1 | 2 | 3 | 4 | 5; // 1 = not important, 5 = very important
      satisfied: boolean; // Was this factor met by selected builder
    }>;
    financialPreferences: {
      budgetAlignment:
        | "under_budget"
        | "within_budget"
        | "over_budget_justified";
      paymentSchedulePreference:
        | "upfront"
        | "milestone"
        | "completion"
        | "flexible";
      valueForMoney: 1 | 2 | 3 | 4 | 5;
      costBreakdownClarity: 1 | 2 | 3 | 4 | 5;
      warrantyImportance: 1 | 2 | 3 | 4 | 5;
    };
  };
  builderFeedback: Array<{
    quoteId: string;
    builderId: string;
    selected: boolean;
    feedback: {
      strengths: string[];
      weaknesses: string[];
      improvementSuggestions: string;
      overallRating: 1 | 2 | 3 | 4 | 5;
      wouldRecommend: boolean;
    };
  }>;
  additionalComments: string;
  submittedAt: string;
}
```

#### 5.2.9 Builder Analytics Model

```typescript
interface BuilderAnalytics {
  id: string;
  builderId: string;
  period: {
    startDate: string;
    endDate: string;
    type: "monthly" | "quarterly" | "yearly";
  };
  performance: {
    totalQuotesSubmitted: number;
    quotesWon: number;
    quotesLost: number;
    winRate: number;
    averageQuoteValue: number;
    averageWinningQuoteValue: number;
  };
  channelPerformance: {
    directInvitations: {
      quotesSubmitted: number;
      quotesWon: number;
      winRate: number;
    };
    hotLeads: {
      leadsAccessed: number;
      quotesSubmitted: number;
      quotesWon: number;
      winRate: number;
      totalSpent: number;
      roi: number;
    };
  };
  selectionFactors: {
    mostCommonWinReasons: Array<{
      factor: string;
      frequency: number;
    }>;
    mostCommonLossReasons: Array<{
      factor: string;
      frequency: number;
    }>;
    averageRatings: {
      cost: number;
      timeline: number;
      communication: number;
      portfolio: number;
      overall: number;
    };
  };
  recommendations: Array<{
    category: "pricing" | "communication" | "portfolio" | "terms";
    suggestion: string;
    impact: "low" | "medium" | "high";
    basedOn: string; // What data this recommendation is based on
  }>;
  marketBenchmark: {
    industryAverageWinRate: number;
    regionalAverageWinRate: number;
    performancePercentile: number; // Where builder ranks (0-100)
  };
  updatedAt: string;
}
```

#### 5.2.10 Real-Time Communication Models

```typescript
interface Conversation {
  id: string;
  projectId: string;
  participants: Array<{
    userId: string;
    userType: "homeowner" | "builder";
    joinedAt: string;
    lastReadAt: string;
  }>;
  title: string;
  status: "active" | "archived" | "closed";
  lastMessageAt: string;
  messageCount: number;
  unreadCount: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "homeowner" | "builder";
  messageType: "text" | "file" | "system" | "decision";
  content: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
  }>;
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: string;
  }>;
  replyTo?: string; // Message ID being replied to
  isEdited: boolean;
  editedAt?: string;
  deliveredAt: string;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  priority: "normal" | "high" | "urgent";
  flaggedForSoW: boolean; // Important decisions for SoW integration
  createdAt: string;
}

interface EmailNotification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  conversationId: string;
  messageIds: string[]; // Messages included in this email
  emailType: "single_message" | "digest" | "urgent";
  subject: string;
  htmlContent: string;
  textContent: string;
  sentAt?: string;
  deliveryStatus: "pending" | "sent" | "delivered" | "failed";
  openedAt?: string;
  clickedAt?: string;
  unsubscribeToken: string;
  createdAt: string;
}
```

#### 5.2.11 SoW Version Control Model

```typescript
interface SoWVersion {
  id: string;
  sowId: string;
  versionNumber: string; // e.g., "1.0", "1.1", "2.0"
  versionType: "major" | "minor" | "patch";
  changes: Array<{
    section: string;
    changeType: "addition" | "deletion" | "modification";
    oldContent?: string;
    newContent?: string;
    userId: string;
    timestamp: string;
    comment?: string;
  }>;
  status: "draft" | "pending_approval" | "approved" | "rejected";
  approvals: Array<{
    userId: string;
    userType: "homeowner" | "builder";
    approved: boolean;
    timestamp: string;
    comments?: string;
  }>;
  createdBy: string;
  createdAt: string;
  approvedAt?: string;
}
```

#### 5.2.12 Planning Permission Prospect Model

```typescript
interface PlanningProspect {
  id: string;
  planningApplicationId: string;
  councilName: string;
  propertyAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
  };
  applicantDetails: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  planningDetails: {
    applicationDate: string;
    projectType: string;
    description: string;
    status: "submitted" | "approved" | "rejected" | "pending";
    estimatedValue?: number;
  };
  marketingStatus: {
    contacted: boolean;
    contactedAt?: string;
    campaignId?: string;
    optedOut: boolean;
    conversionStatus:
      | "prospect"
      | "registered"
      | "project_created"
      | "converted";
  };
  gdprConsent: {
    consentGiven: boolean;
    consentDate?: string;
    optOutDate?: string;
    dataRetentionExpiry: string;
  };
  extractedAt: string;
  updatedAt: string;
}
```

#### 5.2.15 Batch Crawler Models

```typescript
interface CrawlerWebsite {
  id: string;
  url: string;
  councilName: string;
  websiteType: "weekly_list" | "search_results" | "application_feed";
  isActive: boolean;
  crawlingConfig: {
    selectors: {
      applicationContainer: string;
      addressSelector: string;
      nameSelector: string;
      applicationIdSelector?: string;
    };
    rateLimit: number; // requests per minute
    userAgent: string;
    respectRobotsTxt: boolean;
  };
  lastCrawledAt?: string;
  lastSuccessfulCrawl?: string;
  totalApplicationsExtracted: number;
  createdAt: string;
  updatedAt: string;
}

interface BatchCrawlProcess {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  startedBy: string; // Admin user ID
  websitesProcessed: number;
  totalWebsites: number;
  applicationsExtracted: number;
  errors: Array<{
    websiteId: string;
    error: string;
    timestamp: string;
  }>;
  summary: {
    successfulWebsites: number;
    failedWebsites: number;
    newApplications: number;
    duplicatesSkipped: number;
    processingTimeMs: number;
  };
}

interface PlanningApplication {
  id: string;
  applicationId?: string; // Council's application reference
  councilName: string;
  sourceWebsiteId: string;
  propertyAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode?: string;
    fullAddress: string; // Raw extracted address
  };
  applicantName: string;
  extractedData: {
    rawHtml?: string; // Original HTML for debugging
    extractionConfidence: number; // 0-1 confidence score
    dataQuality: "high" | "medium" | "low";
  };
  processingStatus: "extracted" | "validated" | "processed" | "error";
  marketingEligible: boolean;
  duplicateOf?: string; // Reference to original if duplicate
  extractedAt: string;
  batchProcessId: string;
}
```

#### 5.2.16 SoW Payment Transaction Model

```typescript
interface SoWPaymentTransaction {
  id: string;
  projectId: string;
  userId: string;
  sowId: string;
  transactionDetails: {
    amount: number;
    currency: "GBP";
    paymentMethod: "stripe" | "paypal" | "bank_transfer";
    paymentGatewayId: string;
    discountCode?: string;
    discountAmount?: number;
    finalAmount: number;
  };
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentAttempts: Array<{
    timestamp: string;
    status: string;
    errorMessage?: string;
    gatewayResponse: Record<string, any>;
  }>;
  sowAccess: {
    previewAccessGranted: boolean;
    fullAccessGranted: boolean;
    accessGrantedAt?: string;
    accessExpiresAt?: string;
  };
  abTestVariant?: string;
  refundDetails?: {
    refundedAt: string;
    refundAmount: number;
    refundReason: string;
    refundedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 5.2.17 Enhanced Document Model

```typescript
interface DocumentReference {
  id: string;
  projectId: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  uploadContext:
    | "project_creation"
    | "questionnaire"
    | "manual_upload"
    | "builder_upload";
  questionId?: string; // If uploaded during questionnaire
  duplicateDetection: {
    md5Hash: string;
    perceptualHash?: string; // For images using pHash or similar
    isDuplicate: boolean;
    duplicateOfId?: string; // Reference to original document
    duplicateCheckPerformed: boolean;
    duplicateConfirmedByUser?: boolean; // User chose to upload anyway
    similarDocuments?: Array<{
      documentId: string;
      similarityScore: number;
      similarityType: "exact_md5" | "similar_content" | "similar_name";
    }>;
  };
  metadata: {
    uploadedBy: string;
    uploadedAt: string;
    lastAccessedAt?: string;
    downloadCount: number;
    tags?: string[];
    category?: string;
  };
  processingStatus: "pending" | "processed" | "failed";
  aiAnalysis?: {
    documentType: string;
    extractedText?: string;
    relevantSections?: string[];
    analysisDate: string;
  };
}
```

#### 5.2.18 Party Wall Agreement Models

```typescript
interface PartyWallTemplate {
  id: string;
  name: string;
  description: string;
  templateType: "shared_wall" | "boundary_wall" | "excavation" | "general";
  fileDetails: {
    originalFileName: string;
    fileType: "pdf" | "docx" | "doc";
    fileSize: number;
    s3Url: string;
  };
  templateFields: Array<{
    fieldName: string;
    fieldType: "text" | "date" | "address" | "number";
    placeholder: string;
    required: boolean;
    autoPopulate?: "project_address" | "homeowner_name" | "project_description";
  }>;
  legalCompliance: {
    partyWallActCompliant: boolean;
    lastReviewedDate: string;
    reviewedBy: string;
  };
  isActive: boolean;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PartyWallAgreement {
  id: string;
  projectId: string;
  homeownerId: string;
  templateId: string;
  agreementDetails: {
    workDescription: string;
    affectedWallType: "shared_wall" | "boundary_wall" | "excavation";
    proposedStartDate: string;
    estimatedDuration: string;
    workingHours: string;
  };
  neighbors: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
    };
    relationshipToWall: "adjoining_owner" | "affected_party";
    responseToken: string; // Unique token for neighbor response
  }>;
  generatedDocument: {
    fileName: string;
    s3Url: string;
    generatedAt: string;
  };
  status:
    | "draft"
    | "sent"
    | "partially_approved"
    | "fully_approved"
    | "rejected"
    | "expired";
  statutoryNotice: {
    noticePeriod: number; // Days (usually 60 for Party Wall Act)
    sentDate?: string;
    expiryDate?: string;
  };
  responses: string[]; // Array of NeighborResponse IDs
  createdAt: string;
  updatedAt: string;
}

interface NeighborResponse {
  id: string;
  partyWallAgreementId: string;
  neighborId: string;
  responseToken: string;
  response: "approved" | "rejected" | "modifications_requested";
  responseDetails: {
    comments?: string;
    requestedModifications?: string;
    conditions?: string[];
    alternativeStartDate?: string;
    workingHoursRestrictions?: string;
  };
  legalRepresentation: {
    hasLegalRep: boolean;
    solicitorName?: string;
    solicitorContact?: string;
  };
  responseDate: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
```

#### 5.2.13 Face-to-Face Meeting Verification Model

```typescript
interface MeetingVerification {
  id: string;
  projectId: string;
  homeownerId: string;
  builderId: string;
  homeownerConfirmation: {
    confirmed: boolean;
    meetingDate: string;
    confirmedAt?: string;
    comments?: string;
  };
  builderConfirmation: {
    confirmed: boolean;
    propertyVisited: boolean;
    homeownerMet: boolean;
    confirmedAt?: string;
    comments?: string;
  };
  verificationStatus:
    | "pending"
    | "homeowner_confirmed"
    | "builder_confirmed"
    | "both_confirmed"
    | "expired";
  contractEligible: boolean;
  contractGeneratedAt?: string;
  expiresAt: string; // Meeting confirmation expires after certain period
  createdAt: string;
  updatedAt: string;
}
```

#### 5.2.14 SoW Section Structure Model

```typescript
interface SoWSection {
  id: string;
  sowId: string;
  parentSectionId?: string; // For subsections
  sectionNumber: string; // e.g., "1", "1.1", "1.1.1"
  title: string;
  content: string; // Rich text content
  sectionType: "main" | "subsection" | "sub-subsection";
  orderIndex: number; // For drag-and-drop ordering
  isEditable: boolean;
  dependencies: string[]; // Section IDs that this section depends on
  metadata: {
    wordCount: number;
    lastEditedBy: string;
    lastEditedAt: string;
    editHistory: Array<{
      userId: string;
      timestamp: string;
      changeType: "content" | "reorder" | "create" | "delete";
      previousContent?: string;
      previousOrder?: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 5.4 Lambda Code Architecture & Organization

#### 5.4.1 Modular File Structure

```
lambda/
├── src/
│   ├── index.js                 # Main Lambda entry point (lightweight router)
│   ├── handlers/
│   │   ├── auth-handler.js      # Authentication endpoints
│   │   ├── project-handler.js   # Project CRUD operations
│   │   ├── questionnaire-handler.js # AI questionnaire logic
│   │   ├── sow-handler.js       # SoW generation and management
│   │   ├── builder-handler.js   # Builder invitation and management
│   │   ├── document-handler.js  # File upload and document processing
│   │   ├── quote-handler.js     # Quote submission and management
│   │   ├── leads-handler.js     # Hot leads marketplace
│   │   ├── communication-handler.js # Real-time messaging
│   │   ├── party-wall-handler.js # Party wall agreements
│   │   └── admin-handler.js     # Admin panel operations
│   ├── services/
│   │   ├── ai-service.js        # AI/LLM integration
│   │   ├── auth-service.js      # Cognito authentication
│   │   ├── db-service.js        # DynamoDB operations
│   │   ├── s3-service.js        # File storage operations
│   │   ├── email-service.js     # SES email notifications
│   │   ├── payment-service.js   # Payment processing
│   │   └── validation-service.js # Input validation
│   ├── utils/
│   │   ├── response-utils.js    # HTTP response formatting
│   │   ├── error-utils.js       # Error handling and logging
│   │   ├── date-utils.js        # Date manipulation utilities
│   │   └── constants.js         # Application constants
│   ├── middleware/
│   │   ├── auth-middleware.js   # Cognito token validation
│   │   ├── cors-middleware.js   # CORS handling
│   │   ├── logging-middleware.js # Request logging
│   │   └── rate-limit-middleware.js # Rate limiting
│   └── prompts/
│       ├── sow-generation/
│       ├── questionnaire/
│       ├── document-analysis/
│       └── index.js             # Prompt loader utility
```

#### 5.4.2 Main Index.js Structure

```javascript
// index.js - Lightweight router
const authHandler = require("./handlers/auth-handler");
const projectHandler = require("./handlers/project-handler");
const questionnaireHandler = require("./handlers/questionnaire-handler");
// ... other handlers

exports.handler = async (event, context) => {
  const { httpMethod, resource } = event;

  // Route to appropriate handler based on resource path
  switch (resource) {
    case "/auth/{proxy+}":
      return authHandler.handle(event, context);
    case "/projects/{proxy+}":
      return projectHandler.handle(event, context);
    case "/questionnaire/{proxy+}":
      return questionnaireHandler.handle(event, context);
    // ... other routes
    default:
      return { statusCode: 404, body: "Not Found" };
  }
};
```

#### 5.4.3 Handler Pattern

```javascript
// handlers/project-handler.js
const projectService = require("../services/db-service");
const authMiddleware = require("../middleware/auth-middleware");
const responseUtils = require("../utils/response-utils");

exports.handle = async (event, context) => {
  try {
    // Apply middleware
    const user = await authMiddleware.validateToken(event);

    // Route to specific operation
    switch (event.httpMethod) {
      case "GET":
        return await getProjects(event, user);
      case "POST":
        return await createProject(event, user);
      case "PUT":
        return await updateProject(event, user);
      case "DELETE":
        return await deleteProject(event, user);
      default:
        return responseUtils.methodNotAllowed();
    }
  } catch (error) {
    return responseUtils.error(error);
  }
};
```

#### 5.4.4 Service Layer Pattern

```javascript
// services/ai-service.js
const promptManager = require("../prompts");

class AIService {
  static async generateSoW(projectData) {
    const prompt = promptManager.loadPrompt("sow-generation", projectData.type);
    // AI generation logic
  }

  static async generateQuestions(projectData) {
    const prompt = promptManager.loadPrompt(
      "questionnaire",
      "initial-questions"
    );
    // Question generation logic
  }
}

module.exports = AIService;
```

#### 5.4.5 Benefits of Modular Architecture

- **Maintainability**: Easy to locate and modify specific functionality
- **Team Collaboration**: Multiple developers can work on different modules
- **Testing**: Individual modules can be unit tested in isolation
- **Code Reusability**: Services can be shared across handlers
- **Debugging**: Easier to trace issues to specific modules
- **Performance**: Smaller, focused functions with better performance
- **Scalability**: Easy to extract modules into separate Lambda functions if needed

### 5.5 LLM Prompt File Organization

#### 5.5.1 Directory Structure

```
lambda/
├── src/
│   ├── index.js                 # Main Lambda handler
│   ├── prompts/
│   │   ├── sow-generation/
│   │   │   ├── kitchen-renovation.txt
│   │   │   ├── bathroom-renovation.txt
│   │   │   ├── extension.txt
│   │   │   └── general-project.txt
│   │   ├── questionnaire/
│   │   │   ├── initial-questions.txt
│   │   │   ├── follow-up-questions.txt
│   │   │   └── clarification-questions.txt
│   │   ├── document-analysis/
│   │   │   ├── planning-document-analysis.txt
│   │   │   ├── technical-drawing-analysis.txt
│   │   │   └── specification-analysis.txt
│   │   └── index.js             # Prompt loader utility
│   └── handlers/
│       ├── sow-handler.js
│       ├── questionnaire-handler.js
│       └── document-handler.js
```

#### 5.5.2 Prompt Loading System

```javascript
// prompts/index.js - Centralized prompt loader
const fs = require("fs");
const path = require("path");

class PromptManager {
  static loadPrompt(category, promptName) {
    const promptPath = path.join(__dirname, category, `${promptName}.txt`);
    return fs.readFileSync(promptPath, "utf8");
  }

  static getAllPrompts(category) {
    const categoryPath = path.join(__dirname, category);
    return fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith(".txt"))
      .map((file) => file.replace(".txt", ""));
  }
}
```

#### 5.5.3 Implementation Benefits

- **Maintainability**: Easy to find and edit specific prompts
- **Version Control**: Individual file tracking for prompt changes
- **Code Clarity**: Clean separation between logic and prompt content
- **Team Collaboration**: Multiple developers can work on different prompts
- **Testing**: Easier to test individual prompts in isolation
- **Deployment**: Clear visibility of prompt changes in deployments
- Cognito token validation on all protected endpoints
- User ID extraction from Cognito tokens
- Role-based access control enforcement
- Project ownership validation
- Builder access control through invitation system

#### 5.3.2 Data Protection

- Encryption at rest (DynamoDB and S3)
- Encryption in transit (HTTPS/TLS)
- Input validation and sanitization
- SQL injection prevention (NoSQL context)
- XSS protection through proper encoding

#### 5.3.3 Audit & Monitoring

- Comprehensive audit logging
- Failed authentication tracking
- Suspicious activity detection
- Performance monitoring
- Error tracking and alerting

## 6. User Interface Specifications

### 6.1 Design System (User Experience Focused)

- **Material Design**: Consistent with MUI components for familiar user patterns
- **Responsive Design**: Mobile-first approach with seamless device transitions
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Color Scheme**: Professional, trust-building blue/white theme
- **Typography**: Clear hierarchy with readable fonts optimized for construction industry
- **Loading States**: Smooth loading animations and progress indicators for all operations
- **Error Handling**: User-friendly error messages with clear next steps
- **Success Feedback**: Clear confirmation of completed actions

### 6.2 Key UI Components (Optimized for Flow)

#### 6.2.1 Project Dashboard

- **Grid Layout**: Card-based project display
- **Status Indicators**: Visual project status
- **Quick Actions**: Create project, view details
- **Search & Filter**: Find projects quickly
- **Progress Tracking**: Visual completion indicators

#### 6.2.2 Project Creation Wizard

- **Multi-Step Form**: 4-step guided process
- **Progress Indicator**: Step completion tracking
- **Validation**: Real-time form validation
- **Save & Resume**: Draft project capability
- **Document Upload**: Drag-and-drop interface

#### 6.2.3 Address Autocomplete Interface

- **Smart Address Input**: Single address input field with GetAddress.io autocomplete
- **Dropdown Suggestions**: Real-time address suggestions as user types
- **Auto-Population**: Automatic population of separate address fields when suggestion selected
- **Address Validation**: Visual indicators for valid/invalid addresses
- **Manual Override**: Allow manual address entry if autocomplete fails
- **Loading Indicators**: Show loading state while fetching suggestions
- **Error Handling**: Graceful fallback when GetAddress.io service unavailable

#### 6.2.4 Questionnaire Interface

- **Dynamic Forms**: Question type-specific inputs
- **Progress Bar**: Completion percentage
- **Navigation**: Previous/next question flow
- **Review Mode**: Edit previous responses
- **Auto-Save**: Prevent data loss

#### 6.2.5 SoW Display

- **Structured Layout**: Clear section organization with hierarchical numbering
- **Export Options**: PDF generation with current section order
- **Version Control**: Track SoW revisions and section changes
- **Sharing**: Secure builder access with edit permissions
- **Print Optimization**: Professional formatting maintaining section order

#### 6.2.6 Interactive Gantt Chart Interface

- **Timeline Visualization**: Interactive Gantt chart showing project phases and tasks
- **Parallel Streams**: Visual representation of concurrent work streams and trade coordination
- **Critical Path Highlighting**: Emphasize tasks that affect overall project timeline
- **Dependency Lines**: Visual connections showing task dependencies and sequencing
- **Milestone Markers**: Clear indicators for key project milestones and inspections
- **Zoom Controls**: Timeline zoom from daily to monthly views
- **Export Functionality**: Export Gantt chart as PDF or high-resolution image
- **Mobile Optimization**: Touch-friendly interface for mobile and tablet viewing
- **Real-time Updates**: Dynamic chart updates when SoW timeline changes
- **Builder Sharing**: Shareable Gantt charts for builder coordination

#### 6.2.7 SoW Section Editing Interface

- **Inline Editing**: Click-to-edit functionality for any section or subsection
- **Rich Text Editor**: Full formatting toolbar (bold, italic, lists, tables)
- **Drag-and-Drop Handles**: Visual drag handles for section reordering
- **Section Controls**: Add, delete, merge section buttons
- **Live Preview**: Real-time preview of changes as user types
- **Section Numbering**: Automatic renumbering when sections are reordered
- **Validation Indicators**: Visual warnings for dependency conflicts
- **Auto-save Indicators**: Show when content is being saved automatically
- **Undo/Redo Buttons**: Easy access to edit history controls
- **Section Outline**: Collapsible tree view for easy navigation of large SoWs

#### 6.2.8 Real-Time Communication Interface

- **Chat Panel**: Collapsible chat panel accessible from all project pages
- **Conversation List**: List of all project conversations with unread indicators
- **Message Bubbles**: Clean message display with sender identification and timestamps
- **Typing Indicators**: Show when other party is typing with animated dots
- **File Upload**: Drag-and-drop file sharing with progress indicators
- **Message Status**: Visual indicators for sent, delivered, and read messages
- **Message Search**: Search functionality with keyword highlighting
- **Emoji Reactions**: Quick reaction buttons with emoji picker
- **Message Threading**: Reply to specific messages with thread visualization
- **Notification Settings**: Granular control over notification preferences
- **Offline Indicator**: Show when participants are online/offline
- **Message Templates**: Quick access to professional message templates
- **Decision Flagging**: Mark important messages for SoW integration
- **Pre-Contract Focus**: Interface emphasizes SoW discussion and planning phase

#### 6.2.8 Email Notification System

- **Professional Templates**: Branded email templates with conversation context
- **Message Digest**: Aggregate multiple messages into single email
- **Conversation History**: Include relevant conversation history in emails
- **Unsubscribe Management**: Easy unsubscribe and notification preference controls
- **Mobile-Optimized**: Responsive email design for mobile devices
- **Call-to-Action**: Direct links to continue conversation in platform

#### 6.2.9 Builder Hot Leads Interface

- **Lead Marketplace Grid**: Card-based layout showing available leads
- **Lead Preview Cards**:
  - Project type and general description
  - General location (e.g., "North London area")
  - Timeline and urgency indicators
  - Matching score visualization
  - "View Details" and "Purchase Lead" buttons
- **Lead Purchase Modal**:
  - Payment form with pricing display
  - Terms and conditions
  - Purchase confirmation
  - Receipt generation
- **Purchased Leads Dashboard**:
  - Full project details with exact address
  - Homeowner contact information
  - Direct communication tools
  - Quote submission interface
  - Status tracking and analytics

#### 6.2.10 Privacy Protection UI Elements

- **Information Masking**: Partial address display (e.g., "SW1\*\*\* London")
- **Payment Security**: Secure payment forms with encryption indicators
- **Breakpoints**: Mobile, tablet, desktop optimization
- **Touch Interactions**: Mobile-friendly controls
- **Performance**: Optimized loading and rendering
- **Progressive Web App**: App-like experience

## 7. Integration Requirements

### 7.1 External APIs

- **GetAddress.io**: Free UK address autocomplete and validation service
- **Planning Portal API**: Planning permission requirements (future enhancement)
- **Building Control API**: Local authority integration (future enhancement)
- **Payment Gateway**: Stripe integration for transactions
- **Email Service**: AWS SES for notifications

### 7.2 AI/ML Services

- **AWS Bedrock**: Claude models for SoW generation
- **Document Analysis**: AWS Textract for document processing
- **Natural Language Processing**: Question generation and analysis
- **Machine Learning**: Quote scoring and recommendation

### 7.3 Third-Party Services

- **Email Service**: AWS SES for notifications and communication
- **Payment Processing**: Stripe for secure payment handling

## 8. Performance Requirements

### 8.1 Response Times (Startup-Optimized)

- **Page Load**: < 5 seconds initial load (acceptable for startup)
- **API Responses**: < 2 seconds for standard operations
- **File Upload**: Progress indication for large files
- **SoW Generation**: < 5 minutes for complex projects (AI processing time)
- **Search**: < 1 second for project searches (reasonable for small user base)
- **Real-time Messaging**: < 500ms for message delivery

### 8.2 Scalability (Startup Scale)

- **Concurrent Users**: Support 100-200 simultaneous users
- **Data Storage**: Project and document storage for thousands of projects
- **API Throughput**: 500-1000 requests per minute
- **Geographic Distribution**: UK-focused single region deployment

### 8.3 Availability (Startup Level)

- **Uptime**: 99% availability target (reasonable for startup)
- **Backup Strategy**: Single region backup with daily snapshots
- **Monitoring**: Basic health checks and error alerting
- **Recovery**: 4-hour recovery time objective

## 9. Compliance & Legal Requirements

### 9.1 Data Protection

- **GDPR Compliance**: Full compliance with EU regulations including planning data extraction
- **Data Retention**: Configurable retention policies for all user and prospect data
- **Right to Deletion**: User data removal capability including planning prospects
- **Data Portability**: Export user data functionality
- **Privacy Policy**: Clear data usage disclosure including marketing data sources
- **Planning Data Consent**: Specific consent management for extracted planning application data

### 9.2 Building Regulations

- **UK Building Regulations 2010**: Comprehensive compliance
- **Planning Permission**: Automated requirement identification
- **Building Control**: Notification and approval tracking
- **Health & Safety**: CDM Regulations compliance
- **Accessibility**: Building accessibility requirements

### 9.3 Professional Standards

- **RIBA Standards**: Architectural work stage compliance
- **Construction Standards**: Industry best practices
- **Quality Assurance**: BS EN ISO 9001 alignment
- **Environmental**: Sustainability considerations

### 9.4 Platform Liability & Disclaimers

- **Contract Generation Disclaimer**: Platform takes no responsibility after contract generation
- **Performance Disclaimer**: Not responsible for homeowner or builder non-delivery as per contract
- **Change Request Disclaimer**: All change requests after contract generation must be managed directly between client and builder - platform provides no change request management
- **Facilitation Role**: Platform role limited to document preparation and introduction services
- **Independent Verification**: Users must independently verify all credentials and information
- **Legal Advice Disclaimer**: Platform does not provide legal or construction advice
- **Meeting Verification**: Platform relies on user-provided meeting confirmations
- **Communication Scope**: Platform communications limited to pre-contract SoW discussions only
- **Terms & Conditions**: Comprehensive liability limitations clearly stated in website T&Cs

## 10. Testing Requirements

### 10.1 Mandatory Compilation Requirements

- **Feature-Level Compilation**: MANDATORY compilation check after each individual feature implementation
- **Zero Tolerance Policy**: No feature is considered complete until it compiles successfully
- **Incremental Development**: Each feature must be developed, compiled, and tested before moving to next feature
- **Build Verification**: Automated build process must pass for both frontend and backend components
- **Dependency Validation**: All new dependencies must be verified to not break existing compilation
- **Environment Testing**: Compilation must succeed in development, staging, and production environments
- **Rollback Strategy**: If compilation fails, immediately rollback to last working state before proceeding

### 10.2 Automated Testing

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning

### 10.3 Manual Testing

- **User Acceptance Testing**: Real user validation
- **Accessibility Testing**: WCAG compliance verification
- **Cross-Browser Testing**: Multiple browser support
- **Mobile Testing**: Device-specific validation
- **Usability Testing**: User experience optimization

### 10.4 Quality Assurance

- **Code Reviews**: Peer review process
- **Static Analysis**: Code quality tools
- **Continuous Integration**: Automated build and test
- **Deployment Testing**: Production environment validation
- **Monitoring**: Post-deployment health checks

### 10.5 Development Workflow with Compilation Gates

- **Feature Branch Strategy**: Each feature developed in separate branch
- **Pre-Commit Hooks**: Automatic compilation check before code commit
- **CI/CD Pipeline Integration**: Build failure blocks merge to main branch
- **Local Development Requirements**:
  - `npm run build` must succeed before feature completion
  - `npm run test` must pass all existing tests
  - `npm run lint` must pass without errors
- **Documentation Updates**: README and deployment docs updated with each feature
- **Deployment Verification**: Successful deployment to staging environment required

## 11. Deployment & DevOps

### 11.1 Infrastructure as Code

- **CloudFormation**: Complete infrastructure definition
- **Environment Management**: Dev, staging, production
- **Configuration Management**: Environment-specific settings
- **Secret Management**: AWS Secrets Manager integration
- **Backup Strategy**: Automated data backup

### 11.2 CI/CD Pipeline

- **Source Control**: Git-based version control
- **Build Process**: Automated compilation and packaging
- **Testing Integration**: Automated test execution
- **Deployment Automation**: Zero-downtime deployments
- **Rollback Capability**: Quick reversion to previous versions

### 11.3 Monitoring & Logging

- **Application Monitoring**: AWS CloudWatch integration
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and throughput
- **User Analytics**: Usage pattern analysis
- **Security Monitoring**: Threat detection and response

## 12. Future Enhancements

### 12.1 Advanced AI Features

- **Predictive Analytics**: Project outcome prediction
- **Cost Estimation**: AI-powered budget forecasting
- **Risk Assessment**: Automated risk identification
- **Recommendation Engine**: Builder and material suggestions
- **Natural Language Interface**: Voice and chat interactions

### 12.2 Extended Functionality

- **Project Management Tools**: Gantt charts and scheduling (already included)
- **Payment Processing**: Milestone-based payments
- **Review System**: Builder and homeowner ratings
- **Material Procurement**: Basic supplier recommendations

### 12.3 Advanced Communication Features

- **Real-Time Communication System**:
  - In-platform messaging with WebSocket connections
  - Message threading and conversation management
  - File sharing within chat interface
  - Offline message delivery via email
  - Message search and history
  - Typing indicators and read receipts
  - Communication integration with SoW updates

### 12.4 Advanced SoW Management

- **SoW Version Control & Collaborative Editing**:
  - Track changes functionality with additions/deletions highlighting
  - Individual change control (accept/reject specific changes)
  - Version comparison tools and side-by-side analysis
  - Real-time collaborative editing interface
  - Approval workflow for SoW modifications
  - Section editing and reordering capabilities
  - Auto-save and undo/redo functionality

### 12.5 Platform Expansion

- **Mobile Applications**: Native iOS and Android apps
- **API Ecosystem**: Third-party integrations (maps, document signing, etc.)
- **White-Label Solutions**: Platform licensing
- **International Expansion**: Multi-country support
- **Enterprise Features**: Large-scale project management

## 13. Success Metrics & KPIs

### 13.1 User Engagement

- **User Registration**: Monthly new user signups
- **Project Creation**: Projects created per month
- **Completion Rate**: Projects completed successfully
- **User Retention**: Monthly and annual retention rates
- **Session Duration**: Average time spent on platform

### 13.2 Business Metrics

- **Quote Conversion**: Quotes leading to contracts
- **Builder Satisfaction**: Builder retention and ratings
- **Revenue Growth**: Platform revenue metrics
- **Market Share**: Position in UK home improvement market
- **Customer Acquisition Cost**: Cost per new user

### 13.3 Technical Metrics

- **System Performance**: Response times and uptime
- **Error Rates**: Application and API error frequency
- **Security Incidents**: Security breach frequency
- **Data Quality**: Accuracy of generated SoWs
- **Scalability**: System performance under load

## Conclusion

This comprehensive requirements document outlines a sophisticated, AI-powered platform that revolutionizes the UK home improvement industry. The system combines cutting-edge technology with deep understanding of UK building regulations and industry practices to create a seamless experience for both homeowners and builders.

The platform's success depends on careful implementation of security measures, user experience optimization, and continuous iteration based on user feedback. The modular architecture allows for incremental development and future enhancements while maintaining system stability and performance.

Key differentiators include:

- AI-powered SoW generation with UK compliance focus
- Secure builder invitation and access control system
- Comprehensive project management workflow
- Integration with UK building regulations and planning systems
- Professional-grade document management and export capabilities

The platform is positioned to become the leading solution for UK home improvement project management, providing value to homeowners through simplified project management and to builders through qualified lead generation and streamlined quoting processes.
