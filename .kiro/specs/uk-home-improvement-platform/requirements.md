# Requirements Document

## Introduction

The UK Home Improvement Platform is a comprehensive web application that streamlines the process of planning, scoping, and contracting home improvement projects in the UK. The platform analyzes customer inputs including structural designs, calculations, and requirements to generate detailed Scopes of Work (SoW) that comply with UK building regulations. It facilitates the quote collection process from multiple builders and enables contract generation for selected quotes.

## Requirements

### Requirement 1

**User Story:** As a homeowner with no construction experience, I want to be guided through inputting details about my home improvement project, so that I can receive a detailed scope of work and cost estimates.

#### Acceptance Criteria

1. WHEN a user accesses the platform THEN the system SHALL present a guided onboarding process explaining the platform's purpose and benefits
2. WHEN a user starts a project THEN the system SHALL request the property address as the first step
3. WHEN a property address is provided THEN the system SHALL validate the address using UK postcode databases
4. WHEN a user selects a project type THEN the system SHALL provide educational content explaining what each project type involves, typical costs, and timeframes
5. WHEN a user selects a project type THEN the system SHALL display step-by-step guided forms with tooltips and examples for that specific project category
6. WHEN a user uploads structural designs or calculations THEN the system SHALL accept common file formats (PDF, DWG, JPG, PNG) and store them securely
7. WHEN a user provides project requirements THEN the system SHALL capture detailed specifications including dimensions, materials preferences, timeline, and budget constraints through guided questionnaires

### Requirement 2

**User Story:** As a homeowner, I want the system to analyze my inputs and generate a comprehensive Scope of Work following industry standards, so that I can obtain accurate quotes from builders.

#### Acceptance Criteria

1. WHEN the system processes user inputs THEN it SHALL analyze structural designs, calculations, and requirements to identify project scope
2. WHEN generating a SoW THEN the system SHALL ensure compliance with current UK building regulations and industry standards including RICS guidelines, NRM1/NRM2 cost management standards, and RIBA Plan of Work stages
3. WHEN structuring the SoW THEN the system SHALL follow RIBA Plan of Work methodology organizing content by appropriate work stages (0-7)
4. WHEN creating cost estimates THEN the system SHALL use NRM1 (New Rules of Measurement) for order of cost estimating and NRM2 for detailed measurement
5. WHEN creating the SoW THEN the system SHALL include detailed specifications, materials lists, work phases, and deliverables with no ambiguity following RICS professional standards
6. IF critical information is missing THEN the system SHALL prompt the user for specific additional details before generating the SoW
7. WHEN the SoW is complete THEN the system SHALL provide cost estimates based on current UK market rates and material costs using industry-standard measurement methods

### Requirement 3

**User Story:** As a homeowner, I want to share my Scope of Work with multiple builders, so that I can compare quotes for the same specifications.

#### Acceptance Criteria

1. WHEN a user completes their SoW THEN the system SHALL provide options to share it with selected builders
2. WHEN sharing a SoW THEN the system SHALL maintain version control to ensure all builders quote against identical specifications
3. WHEN builders receive a SoW THEN the system SHALL provide them with a standardized quote submission format
4. WHEN multiple quotes are received THEN the system SHALL present them in a comparable format showing costs, timelines, and terms

### Requirement 4

**User Story:** As a homeowner, I want to select a builder and generate a contract, so that I can formalize the agreement for my project.

#### Acceptance Criteria

1. WHEN a user selects a preferred quote THEN the system SHALL initiate the contract generation process
2. WHEN generating a contract THEN the system SHALL incorporate the original SoW, selected quote details, and standard UK construction contract terms
3. WHEN creating the contract THEN the system SHALL ensure legal compliance with UK construction and consumer protection laws
4. WHEN the contract is ready THEN the system SHALL provide options for digital signing by both parties

### Requirement 5

**User Story:** As a builder, I want to receive detailed Scopes of Work following industry standards, so that I can provide accurate quotes for home improvement projects.

#### Acceptance Criteria

1. WHEN a builder receives a SoW invitation THEN the system SHALL provide access to all project documentation and specifications structured according to RIBA Plan of Work stages
2. WHEN reviewing a SoW THEN the system SHALL present information using standard industry formats and measurement methods (NRM1/NRM2) that builders are familiar with
3. WHEN reviewing a SoW THEN the system SHALL allow builders to ask clarification questions through the platform
4. WHEN submitting a quote THEN the system SHALL require builders to address all SoW components with itemized pricing following NRM2 detailed measurement standards
5. WHEN submitting a quote THEN the system SHALL require builders to confirm compliance with NHBC standards and relevant RICS guidelines where applicable
6. WHEN a quote is submitted THEN the system SHALL notify the homeowner and provide quote comparison tools that highlight differences in approach and compliance standards

### Requirement 6

**User Story:** As a platform administrator, I want to ensure all generated SoWs comply with UK building regulations, industry standards, and local planning constraints, so that projects proceed legally and safely.

#### Acceptance Criteria

1. WHEN a property address is provided THEN the system SHALL query relevant council websites and databases to determine if the property is in a conservation area, listed building status, or has other planning restrictions
2. WHEN the system generates any SoW THEN it SHALL reference current UK Building Regulations, Planning Permission requirements, relevant British Standards, and NHBC standards where applicable
3. WHEN residential projects are involved THEN the system SHALL incorporate NHBC (National House Building Council) standards for construction quality and warranty requirements
4. WHEN a property is in a conservation area THEN the system SHALL include specific guidance on conservation area consent requirements and material restrictions following RICS heritage guidance
5. WHEN structural work is involved THEN the system SHALL flag requirements for Building Control approval and structural engineer certification in accordance with RICS structural surveying standards
6. WHEN electrical or plumbing work is specified THEN the system SHALL include requirements for certified tradespeople and compliance certificates following relevant British Standards
7. IF a project requires planning permission THEN the system SHALL clearly indicate this requirement and provide guidance on the application process with links to the relevant local planning authority

### Requirement 7

**User Story:** As a novice homeowner, I want clear guidance and education throughout the process, so that I can make informed decisions about my home improvement project.

#### Acceptance Criteria

1. WHEN a user encounters technical terms THEN the system SHALL provide plain English explanations and glossary definitions
2. WHEN a user reaches decision points THEN the system SHALL provide educational content explaining options, pros and cons, and typical costs
3. WHEN a user is unsure about requirements THEN the system SHALL offer guided questionnaires with examples and visual aids
4. WHEN a user completes each section THEN the system SHALL provide progress indicators and summaries of what has been accomplished
5. WHEN potential issues are identified THEN the system SHALL explain the implications in simple terms and suggest solutions

### Requirement 8

**User Story:** As a user, I want my project data and documents to be secure, so that my personal and property information remains protected.

#### Acceptance Criteria

1. WHEN users upload documents THEN the system SHALL encrypt files during transmission and storage
2. WHEN storing user data THEN the system SHALL comply with UK GDPR requirements and data protection standards
3. WHEN sharing SoWs with builders THEN the system SHALL control access permissions and maintain audit trails
4. WHEN contracts are generated THEN the system SHALL ensure secure storage and access controls for legal documents

### Requirement 9: Comprehensive Project Type Coverage

**User Story:** As a homeowner, I want the platform to support all types of home improvement projects common in the UK, so that I can use the platform regardless of my renovation needs.

#### Acceptance Criteria

1. WHEN homeowners select project types THEN the system SHALL offer the following comprehensive categories:

**Structural Extensions & Conversions:**

- Loft conversions (dormer, hip-to-gable, mansard, velux, roof light)
- Rear extensions (single-storey, double-storey, wrap-around, glass box)
- Side extensions (single-storey, double-storey, infill)
- Basement conversions and excavations (full basement, partial dig-out)
- Garage conversions (to living space, home office, gym, studio)
- Conservatories and orangeries (traditional, modern, lean-to)
- Garden rooms and outbuildings (summer houses, workshops, studios)
- Annexes and granny flats (attached, detached, self-contained)
- Porch additions (enclosed, open, canopy)
- Bay window installations
- Balcony and terrace additions

**Room-Specific Renovations:**

- Kitchen renovations (full refit, partial upgrade, island installation, galley, L-shaped, U-shaped)
- Bathroom renovations (full refit, shower room, en-suite, downstairs WC, wet room, family bathroom)
- Bedroom renovations (master bedroom, children's rooms, guest rooms, nursery)
- Living room renovations (open plan, fireplace installation, built-in storage, snug)
- Dining room renovations (formal, kitchen-diner, breakfast room)
- Home office conversions (study, library, workspace)
- Utility room installations (laundry room, boot room, pantry)
- Hallway and entrance renovations
- Staircase renovations (replacement, refurbishment, spiral stairs)
- Attic room conversions
- Cellar and basement room conversions

**External & Structural Work:**

- Roofing (re-roofing, repairs, flat roof replacement, green roofs, slate, tile, metal)
- Windows and doors (UPVC, timber, aluminium, bi-fold doors, sliding doors, French doors, sash windows)
- Driveways and patios (block paving, resin, tarmac, natural stone, gravel, concrete)
- Garden landscaping and decking (composite, hardwood, raised decking, pergolas)
- Fencing and gates (timber, metal, composite, automated gates)
- External rendering and cladding (K-rend, pebbledash, timber cladding, brick slip)
- Brickwork and stonework (repointing, rebuilding, feature walls)
- Chimneys (installation, removal, repairs, flue lining)
- Guttering and drainage (replacement, repairs, soakaways)
- External staircases and fire escapes

**Systems & Infrastructure:**

- Central heating systems (boiler replacement, radiator upgrades, underfloor heating, heat pumps)
- Electrical rewiring and upgrades (consumer unit, EV charging points, smart home systems)
- Plumbing upgrades (new bathrooms, kitchen plumbing, water pressure, mains water upgrades)
- Insulation (loft, cavity wall, external wall, floor, acoustic insulation)
- Solar panels and renewable energy systems (battery storage, wind turbines)
- Air conditioning and ventilation systems (MVHR, extract fans)
- Security systems (alarms, CCTV, access control)
- Broadband and networking infrastructure
- Gas supply upgrades and connections

**Flooring & Interior Finishes:**

- Hardwood flooring (solid, engineered, parquet, herringbone)
- Laminate and LVT flooring
- Carpet installation (fitted, rugs, stair runners)
- Tiling (ceramic, porcelain, natural stone, mosaic)
- Vinyl and linoleum flooring
- Concrete and resin floors (polished, epoxy)
- Underfloor heating installation
- Skirting and architrave replacement
- Coving and ceiling roses

**Kitchens & Fitted Furniture:**

- Bespoke kitchen design and installation
- Kitchen islands and breakfast bars
- Pantry and larder installations
- Built-in wardrobes and storage
- Fitted bookcases and shelving
- Window seats and storage benches
- Walk-in closets and dressing rooms
- Murphy beds and space-saving furniture
- Home bars and entertainment units

**Bathrooms & Wet Areas:**

- Luxury bathroom suites
- Walk-in showers and steam rooms
- Freestanding and built-in baths
- Heated towel rails and underfloor heating
- Bathroom ventilation systems
- Waterproofing and tanking
- Accessible bathrooms and adaptations
- Cloakrooms and powder rooms
- Spa bathrooms and wellness areas

**Specialist Projects:**

- Swimming pools (indoor, outdoor, natural pools, hot tubs, spas)
- Home cinemas and media rooms (soundproofing, projection, seating)
- Wine cellars and storage solutions (temperature control, racking)
- Accessibility modifications (ramps, stairlifts, wet rooms, door widening)
- Period property restoration (sash windows, lime mortar, traditional materials)
- Listed building renovations (heritage compliance, conservation)
- Soundproofing and acoustic treatments
- Panic rooms and secure storage
- Art studios and creative spaces
- Gyms and fitness rooms
- Saunas and steam rooms
- Greenhouses and potting sheds
- Outdoor kitchens and BBQ areas
- Tree houses and play areas

**Commercial & Mixed-Use:**

- Shop conversions to residential
- Office to residential conversions
- Barn conversions
- Church and chapel conversions
- Pub and restaurant conversions
- Industrial building conversions
- Mixed-use developments

**Maintenance & Repairs:**

- Damp proofing and waterproofing
- Structural repairs (subsidence, settlement)
- Roof repairs and maintenance
- Window and door repairs
- Heating system servicing and repairs
- Electrical fault finding and repairs
- Plumbing repairs and maintenance
- Decorating and painting (interior, exterior)
- Gutter cleaning and repairs
- Pest control treatments

2. WHEN homeowners select "Others" THEN they SHALL be able to describe any project not listed above
3. WHEN AI analyzes "Others" projects THEN it SHALL categorize them into the most appropriate existing category or create a custom project plan
4. WHEN project types are displayed THEN they SHALL be organized in logical categories with clear descriptions and typical cost ranges
5. WHEN homeowners browse project types THEN they SHALL see example images and brief descriptions of each project type
