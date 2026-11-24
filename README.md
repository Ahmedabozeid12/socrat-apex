
# SOCRAT — Car Service Center Management System

**SOCRAT** (صيانة السيارات الألمانية) is a web application for a German-car service center, built with **Oracle APEX 26** and **Oracle Database**. It runs the whole visit of a car: the customer books online, reception opens a job card, technicians and the store work on it, the car goes through the wash, and the cashier issues the invoice and records payments. The manager follows everything from a live dashboard.

The interface is fully Arabic (RTL), with a light and a dark theme that each user can switch between.

> Live demo: `https://oracleapex.com/ords/r/my_apex_555/socrat` — demo accounts are listed in [Demo accounts](#demo-accounts).

---

## Table of contents

- [Features](#features)
- [Roles](#roles)
- [Pages](#pages)
- [Service workflow](#service-workflow)
- [Database](#database)
- [Business rules](#business-rules)
- [Security](#security)
- [Tech stack](#tech-stack)
- [Installation](#installation)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Features

| Area | What it does |
|---|---|
| Appointments | Customers book a time slot online; booked slots are hidden; customers cancel their own bookings in place. |
| Job cards | Master-detail card per visit: vehicle, complaint, odometer, dates, and a grid of services with the technician on each line. |
| Parts & inventory | Parts list with low-stock status, parts issued to a job card with live price and stock lookup, supplier list. |
| Car wash | Wash queue (waiting → in progress → done), standalone wash orders or washes linked to a job card. |
| Invoicing | Invoice from a ready job card or a wash order, discount limited by the user's role, 14% VAT, printable invoice. |
| Payments | Full or partial payments by Cash, Visa, InstaPay, or Wallet, with remaining balance per invoice. |
| Dashboard | KPI cards (today's and this month's revenue, outstanding balance, open job cards, stock value), 30-day revenue chart, job cards by status, late cards and low-stock tables. |
| Alerts | Navigation-bar badge with the number of late job cards plus parts under their reorder level. |
| Customer portal | Self sign-up, "my cars" as cards with an Egyptian-style plate, booking, and booking history. |
| Look & feel | Arabic RTL, light/dark theme per user, role-based welcome screen after login, custom CSS and JavaScript components. |

## Roles

| Role | Lands on | Can use |
|---|---|---|
| Manager (`manager_auth`) | Dashboard | Everything: operations, store, finance, settings |
| Supervisor (`super_auth`) | Dashboard | Operations and settings |
| Reception (`reception_auth`) | Job cards | Job cards, customers & cars, vehicle history, car wash, bookings |
| Storekeeper (`stor_auth`) | Parts list | Parts, parts issue, suppliers |
| Customer (`CUSTOMER_ONLY`) | Home | My cars, book an appointment, my bookings |

Each user is sent to their role's landing page right after login, and the navigation menu only shows the groups their role may open.

## Pages

| Page | Name | Type |
|---|---|---|
| 9999 | Login | Login page with theme toggle |
| 15 | Customer sign-up | Public form |
| 18 | Home | Static landing page with service cards |
| 1 | Dashboard | Cards, charts, classic reports |
| 20 / 21 | Job cards / Job card | Faceted search + report / modal form with interactive grid |
| 22 | Vehicle history | Search + report |
| 5 | Customers & vehicles | Master-detail (side by side) |
| 34 / 35 | Wash order / Car wash | Modal form / queue report |
| 8 / 11 | Parts / Add part | Report / modal form |
| 17 / 19 | Parts issued / Issue part | Report / modal form |
| 25 | Suppliers | Report + modal form |
| 32 / 28 / 31 | Invoices / Create invoice / Invoice | Report / modal form / invoice view |
| 24 | Alerts | Late job cards and low-stock parts |
| 30 | Technicians | Cards with workload bar |
| 12 | Services | Report + modal form |
| 9 | Roles & users | Master-detail |
| 23 / 33 | My cars / Add car | Customer cards / modal form |
| 37 / 38 | Book appointment / My bookings | Customer form / report with cancel button |

## Service workflow

1. **Booking** — the customer picks a car and an available slot (page 37).
2. **Job card** — reception opens a job card for the car, with the complaint and odometer (page 21).
3. **Work** — services are added to the card, each with its technician; the store issues parts against the card (page 19).
4. **Wash** — if requested, the car joins the wash queue (page 35).
5. **Ready** — the card moves through its statuses: New → Under inspection → Waiting approval → In progress → In wash → Ready → Delivered.
6. **Invoice** — the cashier invoices the ready card; services, parts, and wash become invoice lines, then discount and 14% VAT apply (page 28).
7. **Payment** — one or more payments close the invoice (page 31).

## Database

Main tables:

| Table | Holds |
|---|---|
| `CUSTOMERS` | Customer name, phone, national ID, type (individual / company) |
| `VEHICLES` | Plate, make, model, year, color, VIN, size, owner |
| `APPOINTMENTS`, `APPOINTMENT_SLOTS` | Bookings and the time slots they use |
| `JOB_CARDS`, `JOB_STATUS` | Visits and their status |
| `JOB_CARD_SERVICES` | Services done on a card, with technician |
| `SERVICES` | Service catalog with price and expected time |
| `TECHNICIANS` | Technicians, specialty, active flag |
| `PARTS`, `PARTS_ISSUED`, `SUPPLIERS` | Stock, parts used on cards, suppliers |
| `CAR_WASH` | Wash orders and queue |
| `INVOICES`, `INVOICE_ITEMS` | Invoices and their lines |
| `PAYMENTS`, `PAYMENT_METHODS` | Payments and payment methods |
| `USERS`, `ROLES` | Application users and roles (with max discount per role) |

PL/SQL packages hold the business logic (for example `PKG_PAYMENT` for paid and remaining amounts).

## Business rules

- A part can only be issued if enough quantity is on hand; issuing reduces stock in the same transaction.
- Quantities issued must be whole numbers greater than zero.
- A job card's odometer reading can't be lower than the car's last visit.
- Plates, VINs, and phone numbers can't be registered twice.
- A slot that already has an active booking is not offered again; a cancelled booking frees its slot.
- Customers can only cancel their own bookings, and only before the appointment.
- A job card or wash order can be invoiced once.
- The discount on an invoice can't exceed the maximum allowed for the user's role.
- A payment can't be more than the invoice's remaining balance.

## Security

- **Authorization schemes** on every page, not only on menu entries.
- **Checksum-protected URLs** (Page Access Protection) on pages that receive record IDs, so IDs can't be changed by hand in the URL.
- **Session state protection** on application items and computed fields.
- Customer data is filtered by the logged-in customer's ID on the server side, including inside Ajax callbacks.
- Passwords are stored as hashes, never as plain text.

## Tech stack

- Oracle APEX 26.2 (Universal Theme 42)
- Oracle Database, SQL, PL/SQL
- HTML, CSS, JavaScript (APEX JavaScript APIs: `apex.server`, `apex.message`, `apex.region`)
- Theme Roller custom styles: *Socrat Light* and *Socrat Dark*

## Installation

1. **Database objects** — in SQL Workshop → SQL Scripts, run the scripts in `database/` in order:
   tables → sequences → triggers → packages → seed data.
2. **Application** — App Builder → Import → choose `apex/f139248.sql` → install as a new application.
3. **Static files** — make sure the files in `static/` (logo, images, `socrat-welcome.js`) were imported under Shared Components → Static Application Files.
4. **First login** — sign in with the admin account from the seed data and change its password.

> Export the app with App Builder → Export / Import → Export, and the schema with SQL Workshop → Utilities → Generate DDL, then put them in the folders above.

## Screenshots

| Dashboard | Job cards | Invoice |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.<img width="1817" height="936" alt="dash_board" src="https://github.com/user-attachments/assets/e2804593-b9e5-4c9d-a5db-a6b69c108b9c" />
png) | ![Job cards](docs/screenshots/job-cards.png) | ![Invoice](docs/screenshots/invoice.png) |
<img width="1811" height="951" alt="Screenshot From 2026-11-24 05-07-18" src="https://github.com/user-attachments/assets/25debac8-edaf-4f02-b1f3-ffe1b62bdaf6" />
<img width="1850" height="925" alt="parts" src="https://github.com/user-attachments/assets/9ce8da1c-b62f-4a07-b649-3abe8a8133b2" />
<img width="1850" height="925" alt="part_issued" src="https://github.com/user-attachments/assets/39507df8-8239-4568-91d6-f3343743c7ab" />
<img width="1850" height="925" alt="notification" src="https://github.com/user-attachments/assets/db850bd8-b2cb-4b8a-8384-a1d6fa02608d" />
<img width="1850" height="925" alt="create_account" src="https://github.com/user-attachments/assets/6aece2cd-20cc-42a6-a283-6bcda2cb58e7" />
<img width="1850" height="925" alt="client_home_page" src="https://github.com/user-attachments/assets/3df78faa-8e9d-4ae1-8f91-899056743fc0" />
<img width="1846" height="905" alt="car_wash" src="https://github.com/user-attachments/assets/167617f9-61a4-4d1f-9b59-662c22f4ef9e" />
<img width="1846" height="905" alt="cars_customers" src="https://github.com/user-attachments/assets/2d012a04-1a50-4b73-9f49-d80c9ca7dd9f" />
<img width="1846" height="905" alt="car_lo" src="https://github.com/user-attachments/assets/6f77d043-47bf-4fc9-b2bb-36c62ee99ce4" />
<img width="1850" height="925" alt="car_client" src="https://github.com/user-attachments/assets/ff9ff0c6-2b26-4c5f-b4cf-7951ea7ed49e" />
<img width="1850" height="925" alt="appointemetn2" src="https://github.com/user-attachments/assets/a779cd30-335b-427b-b3ed-433e93da0099" />
<img width="1850" height="925" alt="appointement" src="https://github.com/user-attachments/assets/9c5ed930-e212-4a7d-a8ff-767173332e13" />
<img width="1850" height="925" alt="add_car_client" src="https://github.com/user-attachments/assets/bce642ac-5245-4b50-bb81-e19d1f9bec7e" />
<img width="1850" height="925" alt="log_in" src="https://github.com/user-attachments/assets/076c7f8e-3eb6-48cc-8fdd-96f24ae63c25" />
<img width="1850" height="925" alt="techinacls" src="https://github.com/user-attachments/assets/294f7367-b414-4210-81a3-9117aba51b7c" />
<img width="1850" height="925" alt="innvoice" src="https://github.com/user-attachments/assets/d011b13e-5910-4671-afab-e6bd0f2a707e" />
<img width="1850" height="925" alt="invvoice_view" src="https://github.com/user-attachments/assets/7270ea45-e179-4b6a-92de-4b86b1354abc" />
<img width="1846" height="905" alt="job_cards" src="https://github.com/user-attachments/assets/dce39e33-1c95-4042-98e8-69afd6ff51a3" />
<img width="1817" height="936" alt="dash_board" src="https://github.com/user-attachments/assets/f73c3e6e-814d-40d6-9cfb-38e28b46c288" />
| Login | Technicians | My cars |<img width="1846" height="905" alt="الحجوزات" src="https://github.com/user-attachments/assets/fafa12a3-ac5c-4c98-aedc-6558556e9ba8" />
<img width="1850" height="925" alt="user_roles" src="https://github.com/user-attachments/assets/cedc12e7-0b9b-4759-b8db-4dc4a6113771" />
<img width="1850" height="925" alt="supplies" src="https://github.com/user-attachments/assets/b8634623-01f7-4c54-b720-9bea2681d714" />

|---|---|---|
| ![Login](docs/screenshots/login.png) | ![Technicians](docs/screenshots/technicians.png) | ![My cars](docs/screenshots/my-cars.png) |

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Manager | `manager` | 12345 |
| Reception | `RECEPTION` | 12345|
| Storekeeper | `STORE` | 12345 |
| Customer | `01033921476` | *123456789* |

## Roadmap

- [ ] Goods receiving page: receive parts from suppliers and increase stock
- [ ] REST API (ORDS) for car status by plate number
- [ ] SMS / WhatsApp / e-mail notification when a car is ready
- [ ] Booking → job card in one click
- [ ] Audit columns (`created_by`, `updated_by`, `updated_at`) on financial tables
- [ ] Reports: daily cash close, technician productivity, top services, stock movement

## Author

**Ahmed Mohamed Elsayed Abozeid** — Junior Oracle APEX Developer
Cairo, Egypt · ahmeddabozeidd8@gmail.com · [LinkedIn](https://www.linkedin.com/in/ahmed-abozeid-dev/) · [GitHub](https://github.com/Ahmedabozeid12)
