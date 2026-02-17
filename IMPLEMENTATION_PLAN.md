# Turkey Clinic Guide - Implementation Plan

## **Phase A: Critical Path to Launch** (2-3 Weeks)

This is the **minimum viable feature set** to go live and start generating bookings/revenue.

### **Week 1: Clinic Self-Service & Approval System**

#### **Backend Tasks:**

1. **Update User Model**
   - Add new role: `CLINIC_OWNER`
   - Add `status` enum: `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`
   - Relationship: `User.ownedClinic` → `Clinic`

2. **Clinic Registration Endpoint**
   - `POST /api/clinics/register`
   - Creates Clinic with `status: PENDING_APPROVAL`
   - Creates User account with `role: CLINIC_OWNER`
   - Sends confirmation email

3. **Admin Approval Endpoints**
   - `GET /api/admin/clinics/pending`
   - `PUT /api/admin/clinics/:id/approve`
   - `PUT /api/admin/clinics/:id/reject`
   - On approval: Send welcome email with login credentials

#### **Frontend Tasks:**

4. **Clinic Registration Page** (`/clinic/register`)
   - Multi-step form:
     - **Step 1:** Clinic Info (name, address, city, description)
     - **Step 2:** Contact (email, phone, website)
     - **Step 3:** Services & Credentials
     - **Step 4:** Owner Account (email, password)
   - Uses React Hook Form + Zod validation
   - Success: "Under Review" message

5. **Admin Approval UI** (`/admin/clinic-requests`)
   - Table showing pending clinics
   - Preview clinic details
   - Approve/Reject buttons

6. **Clinic Portal** (`/clinic-portal`)
   - Login page (separate from user login)
   - Dashboard showing their clinic stats

---

### **Week 2: Commission Tracking & Invoicing**

#### **Backend Tasks:**

7. **Update Booking Model**
   ```prisma
   model Booking {
     // ... existing
     source       String?   // 'website', 'phone', 'whatsapp'
     commissionRate Float   @default(10.0) // Percentage
     commissionAmount Float? // Calculated value
     invoiceId    String?
     commissionPaid Boolean @default(false)
   }
   ```

8. **Create Invoice Model**
   ```prisma
   model Invoice {
     id           String   @id @default(cuid())
     clinicId     String
     clinic       Clinic   @relation(...)
     periodStart  DateTime
     periodEnd    DateTime
     bookingIds   String[] // Array of booking IDs
     totalBookings Int
     totalCommission Float
     status       InvoiceStatus @default(PENDING)
     createdAt    DateTime @default(now())
   }
   
   enum InvoiceStatus {
     PENDING
     SENT
     PAID
   }
   ```

9. **Invoice Generation Endpoint**
   - `POST /api/admin/invoices/generate`
   - Parameters: `clinicId`, `startDate`, `endDate`
   - Calculates total bookings + commission
   - Returns invoice object (can export as PDF later)

10. **Commission Dashboard**
    - `GET /api/admin/commissions`
    - Shows: Total pending, total paid, by clinic breakdown

#### **Frontend Tasks:**

11. **Admin Commission Dashboard** (`/admin/commissions`)
    - Filter by date range, clinic
    - Table: Clinic | Bookings | Commission | Status
    - "Generate Invoice" button
    - Mark as paid

12. **Clinic Portal - Bookings Tab**
    - Show all bookings received
    - Status: Pending/Confirmed/Cancelled
    - "Accept" / "Reject" buttons
    - Note field to respond to patient

---

### **Week 3: Content Engine (AI Blog)**

#### **Backend Tasks:**

13. **Blog Model & API**
    ```prisma
    model BlogPost {
      id          String   @id @default(cuid())
      title       String
      slug        String   @unique
      content     String   @db.Text
      excerpt     String?
      category    String   // 'guides', 'procedures', 'destinations'
      tags        String[] // ['dental-implants', 'istanbul']
      featuredImage String?
      published   Boolean  @default(false)
      publishedAt DateTime?
      author      String   @default("Turkey Clinic Guide")
      createdAt   DateTime @default(now())
      
      @@index([slug])
      @@index([category])
    }
    ```

14. **CRUD Endpoints**
    - `GET /api/blog` (public)
    - `GET /api/blog/:slug` (public)
    - `POST /api/admin/blog` (admin only)
    - `PUT /api/admin/blog/:id`
    - `DELETE /api/admin/blog/:id`

15. **AI Generation Endpoint**
    - `POST /api/admin/blog/generate`
    - Parameters: `topic`, `keywords`, `targetLength`
    - Calls OpenAI API (GPT-4) with prompt template
    - Returns draft content for admin to review/edit

#### **Frontend Tasks:**

16. **Blog Listing Page** (`/blog`)
    - Grid/list of posts with featured images
    - Filter by category
    - Search

17. **Blog Detail Page** (`/blog/:slug`)
    - Full content with Helmet SEO tags
    - Related posts sidebar
    - "Book a Consultation" CTA at bottom

18. **Admin Blog Manager** (`/admin/blog`)
    - List all posts
    - Create/Edit with rich text editor (TipTap or Quill)
    - "Generate with AI" button (opens modal with topic input)
    - Preview before publish

---

## **Phase B: Competitive Differentiators** (Weeks 4-6)

### **Week 4: Enhanced Trust Signals**

19. **Doctor Profiles**
    - Add `Doctor` model
    - Display on clinic page

20. **Video Introductions**
    - Add `introVideoUrl` to Clinic
    - Embed YouTube/Vimeo on clinic page hero

21. **Live Verification Badges**
    - Add `verificationStatus` to Clinic
    - Admin verifies certifications
    - Display "Verified by TCG" badge

### **Week 5: Price Transparency**

22. **USA Price Comparison**
    - Add `usaAveragePrice` to Procedure
    - Display savings percentage on cards

23. **Package Deals**
    - `Package` model
    - "All-Inclusive" badge on listings

### **Week 6: Communication Tools**

24. **WhatsApp Integration**
    - Add `whatsappNumber` to Clinic
    - Floating WhatsApp button on clinic pages

25. **Multi-Language Starter**
    - Add Turkish translations for key pages
    - Language switcher in navbar
