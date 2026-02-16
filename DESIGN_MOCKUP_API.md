# Design Mockup & PDF Sharing System

## Overview
This document describes the new design mockup and PDF sharing system that was implemented for the Sochamila e-commerce platform. When customers design products, the design files are now stored and shared with admins and vendors.

## Database Changes

### OrderItem Model Enhancement
Added `pdfUrl` field to the `OrderItem` model in `prisma/schema.prisma`:

```prisma
model OrderItem {
  id      String @id @default(uuid())
  orderId String
  sizeId  String

  quantity  Int
  price     Int
  costPrice Int?

  // Optional links to the user's design/mockup/PDF for this item
  imageUrl  String?
  mockupUrl String?
  pdfUrl    String?  // Design file or production specs as PDF

  vendorId String?
  // ... rest of model
}
```

**Migration**: `20260212104508_add_pdf_url_to_order_item`

## Backend Changes

### 1. Order Controller - Accept Design Files
**File**: `src/modules/orders/order.controller.ts`

Updated `placeOrder()` function to accept and store design files:

```typescript
// Request body now accepts:
{
  userId: string,
  items: [
    {
      sizeId: string,
      quantity: number,
      price: number,
      mockupUrl?: string,    // Design preview/mockup
      imageUrl?: string,     // Customer design image
      pdfUrl?: string        // Design PDF or production specs
    }
  ]
}
```

Admin notification includes design file URLs when order is placed.

### 2. Admin Design Retrieval - Get Order Designs
**File**: `src/admin/admin.order.routes.ts`

New endpoint: `GET /api/admin/orders/:orderId/designs`

**Purpose**: Admin can view all design files for an order before assigning to vendors

**Response**:
```typescript
{
  success: true,
  order: {
    id: string,
    customerId: string,
    customer: { id, name, email },
    totalAmount: number,
    status: OrderStatus,
    createdAt: Date
  },
  items: [
    {
      id: string,
      sizeId: string,
      quantity: number,
      price: number,
      fulfillmentStatus: string,
      vendor: { id, name, email } | null,
      design: {
        imageUrl: string | null,      // Customer design image
        mockupUrl: string | null,     // Mockup preview
        pdfUrl: string | null         // Design PDF
      },
      product: { id, name },
      size: { id, label }
    }
  ],
  hasDesigns: boolean
}
```

### 3. Admin Controller - Order Design Service
**File**: `src/admin/admin.controller.ts`

Added `getOrderDesigns()` function to retrieve design files for review by admin before assigning to vendors.

### 4. Vendor Design Retrieval - Assigned Designs
**File**: `src/modules/vendor/vendor.routes.ts` & `vendor.controller.ts`

New endpoint: `GET /api/vendor/assigned-designs`

**Purpose**: Vendor can view all designs assigned to them with design files

**Response**:
```typescript
{
  success: true,
  data: [
    {
      orderItemId: string,
      orderId: string,
      order: {
        id: string,
        customerId: string,
        customer: { id, name, email },
        totalAmount: number,
        status: OrderStatus,
        createdAt: Date
      },
      product: { id, name },
      size: { id, label },
      quantity: number,
      price: number,
      fulfillmentStatus: string,
      design: {
        imageUrl: string | null,      // Customer design
        mockupUrl: string | null,     // Mockup
        pdfUrl: string | null         // Production specs PDF
      },
      hasDesigns: boolean
    }
  ],
  totalAssignedDesigns: number,
  designsWithFiles: number
}
```

Added `getVendorAssignedDesigns()` function to retrieve all designs assigned to the current vendor.

## Data Flow

### 1. Order Creation with Designs
```
Customer → Frontend (Editor/Checkout) 
  → POST /api/orders/place 
    (includes imageUrl, mockupUrl, pdfUrl)
  → Backend stores on OrderItem
  → Admin notification includes design URLs
```

### 2. Admin Review & Assignment
```
Admin → GET /api/admin/orders/:orderId/designs
  → View all designs for order
  → View product/size/quantity info
  → Assign vendor via POST /api/admin/orders/assign/:orderItemId
    (OrderItem now has vendorId)
```

### 3. Vendor Access to Designs
```
Vendor → GET /api/vendor/assigned-designs
  → See all items assigned to them
  → Access imageUrl, mockupUrl, pdfUrl for production
  → Use design files to fulfill order
```

## Integration Points

### Frontend Implementation
The frontend should:
1. When generating mockups/designs, collect:
   - `imageUrl`: Direct link to customer design image
   - `mockupUrl`: Link to generated mockup preview
   - `pdfUrl`: Link to downloadable PDF (specs or full design)
2. Include these URLs in the order creation request
3. Admin dashboard can show design previews before assignment
4. Vendor dashboard can display assigned designs with links to files

### File Storage
Design files should be uploaded to:
- ImageKit (recommended for images)
- AWS S3 or Cloud Storage (for PDFs)
- Return public URLs to include in order

Example flow:
```typescript
// 1. Customer designs product in editor
const design = generateDesign(...);

// 2. Upload files to storage
const imageUrl = await uploadToImageKit(design.image);
const pdfUrl = await uploadToS3(design.pdf);
const mockupUrl = await generateMockup(design);

// 3. Create order with design URLs
await placeOrder({
  userId, items: [{
    sizeId, quantity, price,
    imageUrl,
    mockupUrl,
    pdfUrl
  }]
});
```

## Authentication
- Admin endpoints protected with `ADMIN` role
- Vendor endpoints protected with `VENDOR` role
- Both require valid JWT token via `authMiddleware`

## Error Handling
- Returns 404 if order not found
- Returns 400 if required parameters missing
- Returns 401 if unauthorized
- Returns 500 with detailed error messages in development

## Testing the Endpoints

### Test Admin Design Retrieval
```bash
curl -X GET http://localhost:5000/api/admin/orders/{orderId}/designs \
  -H "Authorization: Bearer {adminToken}"
```

### Test Vendor Design Retrieval
```bash
curl -X GET http://localhost:5000/api/vendor/assigned-designs \
  -H "Authorization: Bearer {vendorToken}"
```

### Test Order Creation with Designs
```bash
curl -X POST http://localhost:5000/api/orders/place \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "items": [{
      "sizeId": "size-id",
      "quantity": 1,
      "price": 999,
      "imageUrl": "https://example.com/design.png",
      "mockupUrl": "https://example.com/mockup.png",
      "pdfUrl": "https://example.com/design.pdf"
    }]
  }'
```

## Summary of Changes

### Database
- ✅ Added `pdfUrl` field to OrderItem
- ✅ Created migration `20260212104508_add_pdf_url_to_order_item`

### Endpoints Added
- ✅ `GET /api/admin/orders/:orderId/designs` - Admin can view order designs
- ✅ `GET /api/vendor/assigned-designs` - Vendor can see assigned designs

### Controllers Updated
- ✅ `orders/order.controller.ts` - Accept pdfUrl in order creation
- ✅ `admin/admin.controller.ts` - Added getOrderDesigns()
- ✅ `vendor/vendor.controller.ts` - Added getVendorAssignedDesigns()

### Routes Updated
- ✅ `admin/admin.order.routes.ts` - Added design retrieval endpoint
- ✅ `vendor/vendor.routes.ts` - Added assigned designs endpoint

## Next Steps

1. **Frontend Integration**: Update checkout to collect and submit design URLs
2. **Admin Dashboard**: Add design preview modal in order management
3. **Vendor Dashboard**: Add designs tab showing customer designs and mockups
4. **File Upload**: Integrate image/PDF upload with ImageKit/S3
5. **Notifications**: Email admins and vendors when designs are received
6. **Download**: Add download buttons for PDFs in admin and vendor views

---

**Backend Build Status**: ✅ All TypeScript compilation successful (npm run build)
**Database Migrations**: ✅ Applied and synced with schema
**Ready for**: Frontend integration and testing
