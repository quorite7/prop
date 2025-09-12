# UK Home Improvement Platform - Development Roadmap (Updated)

## Current State vs Vision Analysis (After Deployment Review)

### 🚨 **CRITICAL SECURITY ISSUES IDENTIFIED**

- **No User-Project Association**: Projects are not linked to users - any user can see all projects
- **No Authentication on Project Endpoints**: Projects API lacks user authentication and authorization
- **Data Privacy Violation**: Builders can see all homeowner projects, homeowners can see each other's projects
- **No Access Control**: No filtering based on user roles or permissions

### ✅ **COMPLETED FEATURES**

- **Requirement 1**: ✅ Comprehensive Project Types (25+ implemented with enhanced UI)
- **Requirement 2**: ✅ User Authentication (AWS Cognito with full registration/login flow)
- **Landing Page**: ✅ Professional landing page with testimonials and CTAs implemented
- **Project Creation**: ✅ 4-step workflow with enhanced project type selection
- **Project Dashboard**: ✅ Basic project listing dashboard exists
- **Individual Project Pages**: ✅ Route exists (`/projects/:projectId`) but needs enhancement
- **Builder Pages**: ✅ Builder dashboard, profile, and quote submission pages exist
- **SoW Review Page**: ✅ Basic SoW display page exists
- **Infrastructure**: ✅ AWS serverless architecture fully deployed

### 🔄 **PARTIALLY IMPLEMENTED**

- **Project Dashboard**: Basic project listing, needs to become the central project hub
- **Builder System**: Registration and basic dashboard exist, needs invitation system
- **SoW System**: Display components exist, needs AI generation backend
- **Quote System**: UI components exist, needs backend integration

### ❌ **MISSING CRITICAL FEATURES**

- **AI-Powered SoW Generation Backend** (Core requirement)
- **Project-Centric Dashboard** (Central hub for project management)
- **AI-Driven Questionnaire System** (For project details collection)
- **Direct LLM Integration** (Before implementing AI agents)
- **Builder Invitation & Quote Management Backend**
- **Payment Processing** (Stripe integration)
- **Property Assessment & Compliance**
- **Contract Generation**
- **Analytics & Reporting**
- **Communication System**

---

## 🎯 **REVISED STRATEGY: PROJECT-CENTRIC DEVELOPMENT**

### **Core Philosophy**

The **Individual Project Page** (`/projects/:projectId`) becomes the **central hub** where homeowners:

1. **Complete project details** through AI-guided questionnaires
2. **Generate SoW** with direct LLM calls (not agents initially)
3. **Invite builders** and manage quotes
4. **Track project progress** through all phases

### **Technical Approach**

- **Direct LLM Integration**: Use OpenAI/Claude API calls initially, implement AI agents later
- **Project-Centric UI**: All functionality revolves around the individual project dashboard
- **Incremental Enhancement**: Build on existing pages rather than creating new ones

---

## 🗺️ **REVISED INCREMENTAL DEVELOPMENT ROADMAP**

### **PHASE 0: CRITICAL SECURITY FIXES (Week 1) - IMMEDIATE PRIORITY**

#### **Sprint 0.1: User-Project Association & Authentication**

**Prompt for AWS Q CLI:**

```
CRITICAL SECURITY FIX: Implement proper user-project association and authentication:
1. Add JWT token validation to all project endpoints in Lambda
2. Extract userId from Cognito JWT token for all authenticated requests
3. Modify project creation to store userId with each project
4. Update project retrieval to filter by userId (homeowners see only their projects)
5. Add userType extraction from JWT to differentiate homeowners vs builders
6. Implement proper access control:
   - Homeowners: Can create, see, and edit their own projects
   - Builders: Can only view projects they've been invited to and submit quotes (cannot create projects)
7. Add database migration to associate existing projects with users (if any test data exists)
8. Update frontend to send Authorization header with JWT token
9. Add proper error handling for unauthorized access attempts
10. Test thoroughly to ensure no data leakage between users
```

#### **Sprint 0.2: Builder Access Control & Project Security**

**Prompt for AWS Q CLI:**

```
Implement builder-specific access control and project security:
1. Create BuilderProjectAccess table to track which builders can access which projects
2. Implement invitation-based access for builders (builders can only view invited projects and submit quotes)
3. Add project ownership validation (only project owner can invite builders)
4. Create secure project sharing mechanism for builder invitations
5. Add audit logging for all project access attempts
6. Implement role-based permissions (homeowner: create/edit projects vs builder: view/quote only)
7. Add project privacy settings and access controls
8. Create secure API endpoints for builder project access
9. Add proper error messages for access denied scenarios
10. Ensure complete data isolation between different users and user types
```

### **PHASE 1: Project Dashboard as Central Hub (Weeks 2-4)**

#### **Sprint 1.1: Enhanced Project Dashboard Foundation**

**Prompt for AWS Q CLI:**

```
Transform the existing ProjectDashboardPage (/projects/:projectId) into a comprehensive project management hub:
1. When projectId is provided, show individual project dashboard with sections for:
   - Project overview (type, address, status)
   - Project details collection (AI-guided questionnaire)
   - SoW generation section (with "Generate SoW" button)
   - Builder invitation section (initially disabled until SoW ready)
   - Project timeline and status tracking
2. When no projectId (dashboard route), show project listing as currently implemented
3. Add project status states: "Details Collection", "SoW Generation", "SoW Ready", "Builders Invited", "Quotes Received"
4. Create tabbed interface for different project phases
5. Maintain all existing project listing functionality
6. Ensure responsive design for mobile and desktop
```

#### **Sprint 1.2: AI-Guided Project Questionnaire System**

**Prompt for AWS Q CLI:**

```
In the Details section on the project dashboard, implement GenAI-guided questionnaire system for project details collection:
1. Connect with Sonnet3.7 model on Amazon Bedrock to carry out GenAI conversation
2. When conversing with GenAI model, let the AI model know about all the details the user has already provided such as project type, project vision, project documents, timelines, budget (all that was provded while setting up the project).
3. Create dynamic questionnaire component that shows one question at a time
4. Add project-type-specific questions based on the selected project type
5. Implement question flow logic with conditional questions based on previous answers
6. Add progress tracking for questionnaire completion
7. Store questionnaire responses in DynamoDB linked to project
8. Create "Continue Questionnaire" and "Complete Details" functionality
9. Add ability to review and edit previous answers
10. Integrate questionnaire into the project dashboard as the first major section
11. Ensure questionnaire data is properly validated and stored
12. Make sure that you compile the project succesfully and when I instruct then you try to deploying anything on AWS
```

#### **Sprint 1.3: Direct LLM Integration for SoW Generation**

**Prompt for AWS Q CLI:**

```
Implement direct LLM integration for SoW generation:
1. Based upon the data collected from the user a SoW has to be generated
2. Use Bedrock API integration to Lambda function
3. Create SoW generation endpoint that takes project details and questionnaire responses
4. Implement prompt engineering for generating detailed SoW based on UK building standards
5. Add 30-minute processing simulation with proper status tracking
6. Generate SoW with sections: scope, materials (builder vs homeowner), labor, timeline
7. Store generated SoW in DynamoDB linked to project
8. Create SoW display component in project dashboard
9. Add "Generate SoW" button that triggers generation and shows progress
10. Implement SoW regeneration capability when project details change
11. Add basic cost estimation in the generated SoW
```

### **PHASE 2: Builder Integration & Quote Management (Weeks 5-7)**

#### **Sprint 2.1: Secure Builder Invitation System from Project Dashboard**

**Prompt for AWS Q CLI:**

```
Implement secure builder invitation system integrated into project dashboard:
1. There's already a "Invite Builders" section under the Builders tab on the project dashboard (enabled after SoW generation)
2. Create secure one-time invitation code generation with expiration
3. Implement builder registration with invitation code validation to register on the platform and project association
3.1. When a builder already on the platform recieves a new invitation code, they will be able to get access to the project using this activation code
3.2. When a builder who is not on the plafrom receives an activation code, they will be allowed to register to the platform using the activation code, which also give them access to the project they were invited for. So for a new builder, the activation code gives them access to the platform and a project
4. Add builder access to specific projects ONLY via valid invitation codes (view and quote only)
5. Create secure builder project view showing SoW and quote submission interface (no project creation)
6. Add builder quote submission functionality with proper user validation
7. Display invited builders and their status in project dashboard (owner only)
8. Implement secure quote comparison interface in project dashboard
9. Add builder selection workflow from project dashboard with ownership validation
10. Ensure builders cannot access projects they weren't invited to
```

#### **Sprint 2.2: Secure Quote Management and Comparison**

**Prompt for AWS Q CLI:**

```
Build secure quote management system within project dashboard:
1. Create quote display and comparison interface with proper access controls
2. Add quote status tracking with user validation (invited, submitted, reviewed, selected)
3. Implement quote analysis with user-specific data isolation
4. Add builder timeline comparison with access control validation
5. Create quote selection workflow with project ownership confirmation
6. Add quote modification capabilities for builders (only for their own quotes)
7. Implement secure quote notifications and status updates
8. Add quote history and audit trail with user tracking
9. Create secure "Meet before contract" workflow initiation
10. Ensure all quote management respects user permissions and project ownership
```

### **PHASE 3: Enhanced SoW & Contract System (Weeks 8-10)**

#### **Sprint 3.1: Advanced SoW Features with Direct LLM**

**Prompt for AWS Q CLI:**

```
Enhance SoW generation with advanced features using direct LLM calls:
1. Improve LLM prompts for more detailed and accurate SoW generation
2. Add Gantt chart generation and display in project dashboard
3. Implement SoW modification and regeneration based on user feedback
4. Add materials breakdown with cost estimates (builder vs homeowner provided)
5. Create SoW version control and change tracking
6. Add SoW export to PDF functionality
7. Implement collaborative SoW editing between homeowner and builders
8. Add SoW validation and completeness checking
9. Create SoW templates for different project types
10. Integrate all SoW functionality seamlessly into project dashboard
```

#### **Sprint 3.2: Contract Generation and Management**

**Prompt for AWS Q CLI:**

```
Implement contract generation system integrated with project dashboard:
1. Create contract generation based on selected quote and finalized SoW
2. Add contract templates compliant with UK building regulations
3. Implement digital signature workflow (prepare for DocuSign integration)
4. Create contract storage and retrieval system
5. Add contract status tracking in project dashboard
6. Implement "Meet before contract" workflow and confirmation
7. Create contract modification and amendment capabilities
8. Add legal terms and conditions management
9. Implement contract PDF generation and download
10. Ensure contract workflow is seamlessly integrated into project dashboard
```

### **PHASE 4: Payment Integration & Advanced Features (Weeks 10-12)**

#### **Sprint 4.1: Payment Processing Integration**

**Prompt for AWS Q CLI:**

```
Implement Stripe payment processing with tiered access:
1. Integrate Stripe payment processing for homeowner subscriptions
2. Create tiered access system (free vs paid) affecting SoW detail level
3. Implement builder subscription and lead purchasing system
4. Add payment status tracking in project dashboard
5. Create billing and subscription management interface
6. Implement discount code system and campaign management
7. Add payment history and invoice generation
8. Create payment failure handling and retry mechanisms
9. Implement subscription-based feature access control
10. Ensure payment integration doesn't disrupt existing project workflows
```

#### **Sprint 4.2: Property Assessment and Compliance**

**Prompt for AWS Q CLI:**

```
Add property assessment and compliance checking to project workflow:
1. Integrate property data retrieval from Council websites
2. Add Conservation Area and Listed Building status checking
3. Implement planning permission requirement detection
4. Create compliance warnings and notifications in project dashboard
5. Add regulatory compliance integration to SoW generation
6. Implement property-specific requirement handling
7. Create compliance documentation and guidance
8. Add compliance status tracking in project dashboard
9. Integrate compliance checks into the project creation workflow
10. Ensure compliance features enhance rather than complicate user experience
```

### **PHASE 5: Analytics & Communication (Weeks 13-15)**

#### **Sprint 5.1: Analytics and Reporting System**

**Prompt for AWS Q CLI:**

```
Build analytics and reporting integrated with project dashboard:
1. Create project analytics showing progress, timelines, and costs
2. Implement builder performance analytics and insights
3. Add quote variance tracking and analysis
4. Create homeowner project insights and recommendations
5. Implement geographic and project type analytics
6. Add financial reporting and cost tracking
7. Create usage analytics and user behavior insights
8. Build export capabilities for analytics data
9. Add predictive analytics for project outcomes
10. Integrate analytics seamlessly into project dashboard and admin interfaces
```

#### **Sprint 5.2: Communication and Notification System**

**Prompt for AWS Q CLI:**

```
Implement comprehensive communication system:
1. Create multi-channel notification system (email, SMS, WhatsApp)
2. Add real-time project status updates and notifications
3. Implement in-project messaging between homeowners and builders
4. Create automated milestone and deadline notifications
5. Add urgent alert system for time-sensitive actions
6. Implement communication preferences management
7. Create notification history and delivery tracking
8. Add communication templates and automation
9. Integrate notifications with all project dashboard workflows
10. Ensure communication system enhances project collaboration
```

### **PHASE 6: AI Agents Implementation (Weeks 16-18)**

#### **Sprint 6.1: Multi-Agent AI Architecture**

**Prompt for AWS Q CLI:**

```
Replace direct LLM calls with sophisticated AI agent system:
1. Implement AI agent management system and orchestration framework
2. Create specialized AI agents (Windows, Doors, Electrical, Plumbing, etc.)
3. Add high-level orchestrating agents (Kitchen, Bathroom, Bedroom)
4. Implement agent coordination and context sharing
5. Create Timeline Optimization Agent for parallel work analysis
6. Add AI prompt management system in DynamoDB with versioning
7. Implement agent conflict resolution and priority handling
8. Create agent performance monitoring and optimization
9. Replace existing direct LLM SoW generation with multi-agent system
10. Ensure agent system provides better results than direct LLM approach
```

#### **Sprint 6.2: Advanced AI Features and Optimization**

**Prompt for AWS Q CLI:**

```
Implement advanced AI capabilities and system optimization:
1. Add AI-powered project recommendation and optimization
2. Implement intelligent builder matching based on project requirements
3. Create AI-driven cost optimization and timeline predictions
4. Add predictive analytics for project risks and outcomes
5. Implement AI-powered quote analysis and red flag detection
6. Create intelligent project categorization for "Others" project types
7. Add AI-driven material recommendations and sourcing
8. Implement continuous learning from project outcomes
9. Create AI performance analytics and optimization tools
10. Ensure AI enhancements provide measurable value over previous implementations
```

---

## 🎯 **KEY STRATEGIC CHANGES**

### **1. Project Dashboard as Central Hub**

- **Before**: Separate pages for different functions
- **After**: Everything happens within the individual project dashboard context
- **Benefit**: Unified user experience, better project tracking, clearer workflow

### **2. Direct LLM Before AI Agents**

- **Before**: Implement complex AI agent system immediately
- **After**: Start with direct OpenAI/Claude API calls, evolve to agents
- **Benefit**: Faster implementation, easier debugging, gradual complexity increase

### **3. Enhanced Existing Pages**

- **Before**: Create many new pages and components
- **After**: Enhance existing ProjectDashboardPage and related components
- **Benefit**: Leverage existing work, maintain consistency, reduce development time

### **4. Incremental Feature Integration**

- **Before**: Build features in isolation then integrate
- **After**: Build features directly into project dashboard workflow
- **Benefit**: Better user experience, natural feature discovery, cohesive functionality

### **5. Clear Role Separation**

- **Homeowners**: Full project lifecycle (create, edit, manage, invite builders)
- **Builders**: View-only access to invited projects + quote submission capabilities
- **Benefit**: Clear separation of concerns, prevents unauthorized project creation by builders

---

## 🔧 **TECHNICAL IMPLEMENTATION NOTES**

### **Project Dashboard Enhancement Strategy**

- **Existing Route**: `/projects/:projectId` already exists and routes to ProjectDashboardPage
- **Current State**: Basic project listing when no projectId, needs individual project hub
- **Enhancement Approach**: Add conditional rendering based on projectId parameter
- **Data Flow**: Project details → AI questionnaire → SoW generation → Builder invitations → Quotes

### **Direct LLM Integration Approach**

- **API Choice**: Start with OpenAI GPT-4 or Claude API for SoW generation
- **Prompt Engineering**: Create detailed prompts for UK building standards compliance
- **Cost Management**: Implement usage tracking and cost controls
- **Evolution Path**: Replace with AI agents in Phase 6 for better orchestration

### **Database Schema Additions Needed**

```sql
-- Project questionnaire responses
ProjectQuestions: {
  projectId: string,
  questionId: string,
  answer: string,
  timestamp: string
}

-- Generated SoW documents
ProjectSoW: {
  projectId: string,
  version: number,
  content: object,
  status: string,
  generatedAt: string
}

-- Builder invitations and quotes
BuilderInvitations: {
  projectId: string,
  builderId: string,
  invitationCode: string,
  status: string,
  createdAt: string
}
```

### **API Endpoints to Add**

```
POST /projects/{id}/questionnaire    - Save questionnaire responses
GET  /projects/{id}/questionnaire    - Get questionnaire progress
POST /projects/{id}/generate-sow     - Trigger SoW generation
GET  /projects/{id}/sow             - Get generated SoW
POST /projects/{id}/invite-builders  - Generate builder invitations
GET  /projects/{id}/quotes          - Get project quotes
```

---

## 📋 **SUCCESS CRITERIA FOR REVISED APPROACH**

### **Phase 0 Success Metrics (CRITICAL)**

- **Complete Data Isolation**: Users can only see their own projects
- **Secure Authentication**: All project endpoints require valid JWT tokens
- **Role-Based Access**: Homeowners and builders have appropriate permissions
- **Builder Access Control**: Builders can only view invited projects and submit quotes (cannot create projects)
- **Audit Trail**: All access attempts are logged and monitored
- **Zero Data Leakage**: Comprehensive testing confirms no cross-user data access

### **Phase 1 Success Metrics**

- Project dashboard becomes the primary interface for all project activities
- AI questionnaire system collects comprehensive project details
- Direct LLM integration produces quality SoW documents
- Users can complete entire project setup workflow in one interface

### **Phase 2 Success Metrics**

- Builder invitation system works seamlessly from project dashboard
- Quote management provides clear comparison and selection tools
- All builder interactions are properly tracked and managed
- Project status accurately reflects current phase and next steps

### **Phase 3 Success Metrics**

- Advanced SoW features provide professional-quality documentation
- Contract generation produces legally compliant documents
- Version control enables productive collaboration
- All document workflows are integrated into project dashboard

### **Phase 4 Success Metrics**

- Payment processing enables tiered access and builder subscriptions
- Property assessment provides accurate compliance information
- All premium features enhance rather than complicate user experience
- Financial workflows are seamlessly integrated

### **Phase 5 Success Metrics**

- Analytics provide actionable insights for all user types
- Communication system ensures timely, relevant notifications
- Project collaboration tools enable productive homeowner-builder interaction
- All features work together cohesively within project dashboard

### **Phase 6 Success Metrics**

- AI agent system provides superior results to direct LLM approach
- Advanced AI features deliver measurable improvements in project outcomes
- System performance and accuracy exceed previous implementations
- AI capabilities provide competitive advantage and user value

---

## 🚨 **RISK MITIGATION FOR REVISED APPROACH**

### **CRITICAL SECURITY RISKS (IMMEDIATE ATTENTION REQUIRED)**

- **Data Privacy Violation**: Current system allows any user to see all projects

  - **Mitigation**: Implement Phase 0 security fixes immediately before any other development
  - **Testing**: Comprehensive security testing with multiple user accounts
  - **Validation**: Ensure complete data isolation between users

- **Unauthorized Access**: No authentication on project endpoints

  - **Mitigation**: Add JWT validation to all protected endpoints
  - **Implementation**: Extract and validate userId from Cognito tokens
  - **Monitoring**: Add audit logging for all access attempts

- **Builder Access Control**: Builders can currently see all homeowner projects
  - **Mitigation**: Implement invitation-based access control system
  - **Security**: Create BuilderProjectAccess table for permission tracking
  - **Validation**: Ensure builders can only access invited projects

### **Technical Risks**

- **LLM API Costs**: Monitor usage and implement cost controls
- **Project Dashboard Complexity**: Use progressive disclosure and clear navigation
- **Integration Challenges**: Maintain existing functionality while adding features
- **Performance Issues**: Optimize database queries and API calls

### **User Experience Risks**

- **Feature Overload**: Implement features gradually with user testing
- **Navigation Confusion**: Maintain clear project status and next steps
- **Mobile Experience**: Ensure project dashboard works well on all devices
- **Learning Curve**: Provide contextual help and onboarding

### **Business Risks**

- **Development Speed**: Focus on core value-adding features first
- **User Adoption**: Maintain existing workflows while enhancing them
- **Quality Assurance**: Implement comprehensive testing for each phase
- **Scalability**: Design for growth from the beginning

---

## 📈 **EXPECTED OUTCOMES WITH REVISED APPROACH**

### **Immediate Benefits (Phase 1)**

- **Unified User Experience**: All project activities in one dashboard
- **Faster Development**: Build on existing ProjectDashboardPage
- **Better User Adoption**: Natural workflow progression
- **Reduced Complexity**: Single interface for project management

### **Medium-term Benefits (Phases 2-4)**

- **Streamlined Builder Integration**: Seamless invitation and quote process
- **Professional Documentation**: Quality SoW and contract generation
- **Revenue Generation**: Payment processing and subscription tiers
- **Compliance Assurance**: Automated property assessment and regulations

### **Long-term Benefits (Phases 5-6)**

- **Intelligent Automation**: AI-powered project optimization
- **Competitive Advantage**: Advanced AI agent coordination
- **Scalable Platform**: Analytics-driven continuous improvement
- **Market Leadership**: Comprehensive home improvement ecosystem

### **Key Success Metrics**

1. **User Engagement**: Time spent in project dashboard increases
2. **Conversion Rate**: Project creation to SoW generation completion
3. **Builder Adoption**: Successful quote submissions and selections
4. **Revenue Growth**: Subscription and lead purchase conversions
5. **Quality Metrics**: SoW accuracy and user satisfaction scores

This revised approach ensures faster time-to-value while building toward the comprehensive vision outlined in Final_requirements.md, with the project dashboard serving as the central hub for all user interactions.
