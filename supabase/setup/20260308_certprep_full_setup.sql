
-- CertPrep Academy Supabase setup
-- Run this full file in the Supabase SQL Editor on a fresh or existing project.
-- Order included:
-- 1. Phase 2 learning schema
-- 2. Phase 2 CCNA seed data
-- 3. Phase 3 quiz schema
-- 4. Phase 3 quiz seed data
-- 5. Phase 4 exam simulator schema
-- 6. Phase 4 exam config seed data
-- 7. Phase 5 labs schema and storage preparation
-- 8. Phase 5 CCNA lab seed data
-- 9. Phase 6 CLI practice schema
-- 10. Phase 6 CCNA CLI challenge seed data
-- 11. Phase 7 tutor support schema
-- 12. Phase 7 tutor profile seed data
-- 13. Phase 8 billing schema
-- 14. Phase 8 billing plan seed data
-- 15. Phase 9 guidance schema
-- 16. Phase 10 admin authorization and content operations schema

-- ==============================
-- Phase 2: Learning foundation
-- Source: supabase\migrations\20260308_phase2_learning_foundation.sql
-- ==============================
create extension if not exists pgcrypto;

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  level text not null default 'associate',
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (certification_id, title)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (course_id, slug),
  unique (course_id, order_index)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text not null default '',
  content text not null default '',
  order_index integer not null check (order_index > 0),
  estimated_minutes integer not null check (estimated_minutes > 0),
  video_url text null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (module_id, slug),
  unique (module_id, order_index)
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, lesson_id)
);

create index if not exists idx_courses_certification_id on public.courses(certification_id);
create index if not exists idx_courses_is_published on public.courses(is_published);
create index if not exists idx_modules_course_id on public.modules(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_lesson_id on public.user_progress(lesson_id);
create index if not exists idx_user_progress_completed on public.user_progress(completed);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at_timestamp();

alter table public.certifications enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "certifications_select_authenticated" on public.certifications;
create policy "certifications_select_authenticated"
on public.certifications
for select
to authenticated
using (true);

drop policy if exists "courses_select_authenticated" on public.courses;
create policy "courses_select_authenticated"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "modules_select_authenticated" on public.modules;
create policy "modules_select_authenticated"
on public.modules
for select
to authenticated
using (true);

drop policy if exists "lessons_select_authenticated" on public.lessons;
create policy "lessons_select_authenticated"
on public.lessons
for select
to authenticated
using (true);

drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_progress_delete_own" on public.user_progress;
create policy "user_progress_delete_own"
on public.user_progress
for delete
to authenticated
using (auth.uid() = user_id);

grant select on public.certifications to authenticated;
grant select on public.courses to authenticated;
grant select on public.modules to authenticated;
grant select on public.lessons to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;


-- ==============================
-- Phase 2: CCNA seed data
-- Source: supabase\seeds\20260308_ccna_starter_content.sql
-- ==============================
insert into public.certifications (name, slug, description)
values
  (
    'CCNA',
    'ccna',
    'Cisco Certified Network Associate track focused on foundational networking, security, and automation skills.'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.courses (
  certification_id,
  title,
  slug,
  description,
  level,
  is_published
)
select
  c.id,
  'CCNA 200-301 Preparation',
  'ccna-200-301-preparation',
  'Structured CCNA prep course covering networking fundamentals, switching, routing, services, security, and automation.',
  'associate',
  true
from public.certifications c
where c.slug = 'ccna'
on conflict (slug) do update
set
  certification_id = excluded.certification_id,
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  is_published = excluded.is_published;

insert into public.modules (course_id, title, slug, description, order_index)
select
  c.id,
  x.title,
  x.slug,
  x.description,
  x.order_index
from public.courses c
cross join (
  values
    ('Network Fundamentals', 'network-fundamentals', 'Core networking concepts, OSI model, media, and addressing essentials.', 1),
    ('Network Access', 'network-access', 'Switching, VLANs, trunking, and secure access within local networks.', 2),
    ('IP Connectivity', 'ip-connectivity', 'Routing concepts, static routes, and OSPF behavior for scalable connectivity.', 3),
    ('IP Services', 'ip-services', 'DHCP, NAT, NTP, DNS, and first-hop redundancy service fundamentals.', 4),
    ('Security Fundamentals', 'security-fundamentals', 'Network hardening basics, device access control, and threat mitigation.', 5),
    ('Automation and Programmability', 'automation-and-programmability', 'Controllers, APIs, and automation workflows for modern operations.', 6)
) as x(title, slug, description, order_index)
where c.slug = 'ccna-200-301-preparation'
on conflict (course_id, slug) do update
set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

delete from public.lessons
where module_id in (
  select m.id
  from public.modules m
  join public.courses c on c.id = m.course_id
  where c.slug = 'ccna-200-301-preparation'
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url
from public.modules m
join (
  values
    (
      'network-fundamentals',
      'Network Devices and Their Roles',
      'network-devices-and-their-roles',
      'Understand the main job of endpoints, switches, routers, servers, and firewalls in a simple network.',
      '## Simple Explanation

A network is a group of connected devices that share information and services. Some devices create or receive data, and some devices help move that data to the right place. For the CCNA exam, you should know what each major network component does and why it matters.

## Key Concepts

- A network allows connected devices to communicate.
- A node is any device connected to the network.
- End hosts, also called endpoints, are the source or destination of data.
- A client requests a service, such as opening a website.
- A server provides a service, such as sending a web page back to the client.
- A switch connects devices inside the same LAN and forwards frames using MAC addresses.
- A router connects different networks and forwards packets using IP addresses.
- A firewall filters traffic according to security rules.
- A next-generation firewall adds deeper inspection and extra security features.

## Important Points for the CCNA Exam

- Switches are mainly used for communication inside the same local network.
- Routers are used when traffic must move between different networks.
- MAC addresses are important for switching decisions.
- IP addresses are important for routing decisions.
- Firewalls are security devices, not just forwarding devices.

## Real World Example

In a branch office, employee laptops connect to a switch. The switch connects to a router, and the router connects the office to the internet. A firewall can sit between the office and the internet to block unwanted traffic. If a user opens a cloud app, the laptop is the client and the cloud system is the server.

## Quick Review

- Endpoints create and receive data.
- Switches move traffic inside a LAN.
- Routers move traffic between networks.
- Firewalls protect the network by filtering traffic.

## Key Terms

- Network
- Node
- End host
- Endpoint
- Client
- Server
- Switch
- Router
- Firewall
- Next-generation firewall

## Mini Practice Questions

1. Which device mainly forwards traffic inside the same LAN?
2. Which device mainly forwards packets between different networks?',
      1,
      14,
      'https://www.youtube.com/watch?v=H8W9oMNSuwo'
    ),
    (
      'network-fundamentals',
      'Packet Tracer Basics',
      'packet-tracer-basics',
      'Learn how Packet Tracer helps you practice Cisco networking without needing real hardware.',
      '## Simple Explanation

Cisco Packet Tracer is a simulation tool used to practice networking on your computer. It lets you build small or large topologies, connect devices together, and test commands before working on real hardware. It is one of the most useful practice tools for CCNA students.

## Key Concepts

- Packet Tracer simulates common Cisco devices.
- You can add routers, switches, PCs, firewalls, and other devices to a topology.
- Devices can be connected with virtual cables.
- Many devices can be configured through the CLI.
- It is a safe place to practice labs and troubleshooting steps.

## Important Points for the CCNA Exam

- Packet Tracer is widely used for CCNA study and lab practice.
- It helps you practice CLI commands and connectivity testing.
- It is not identical to real hardware, but it is good for learning core concepts.
- You should be comfortable opening devices, connecting them, and using the CLI.

## Real World Example

If you want to practice router interfaces, switch VLANs, or basic IP addressing, you can build the topology in Packet Tracer first. That lets you make mistakes, fix them, and repeat the lab without touching production hardware.

## Quick Review

- Packet Tracer is a simulation and practice tool.
- It supports topology building and CLI work.
- It is useful for CCNA labs and troubleshooting practice.

## Key Terms

- Packet Tracer
- Topology
- Simulation
- CLI
- Lab practice

## Mini Practice Questions

1. Why is Packet Tracer useful for a CCNA student?
2. What is one major way Packet Tracer helps with lab practice?',
      2,
      10,
      'https://www.youtube.com/watch?v=a1Im6GYaSno'
    ),
    (
      'network-fundamentals',
      'Wireless Access Points',
      'wireless-access-points',
      'See how access points let wireless devices join the network and reach the wired LAN.',
      '## Simple Explanation

An access point, or AP, gives wireless devices a way to connect to the network. It acts like the wireless entry point into the LAN. Without access points, laptops, tablets, and phones would not be able to join the network over Wi-Fi.

## Key Concepts

- An access point provides wireless connectivity.
- It connects wireless clients to the wired network.
- Wireless users still need normal network services like IP addressing and routing.
- Access points are common in offices, schools, and public spaces.

## Important Points for the CCNA Exam

- AP stands for access point.
- Access points connect wireless users to the network.
- Wireless networks are still part of the same larger IP network design.
- You should be able to describe an AP in simple terms on the exam.

## Real World Example

In a classroom, students connect laptops to Wi-Fi. The access point in the room sends their traffic into the wired school network so they can reach learning platforms and cloud services.

## Quick Review

- An AP provides Wi-Fi access.
- It links wireless devices to the rest of the network.
- It is a key part of wireless network design.

## Key Terms

- Access Point
- AP
- Wireless client
- Wi-Fi
- Wired network

## Mini Practice Questions

1. What is the main role of an access point?
2. Do wireless clients connect directly to the wired LAN without an AP in a normal enterprise Wi-Fi design?',
      3,
      9,
      'https://www.youtube.com/watch?v=uX1h0F6wpBY'
    ),
    (
      'network-fundamentals',
      'Wireless LAN Controllers',
      'wireless-lan-controllers',
      'Understand how lightweight access points are centrally managed through a wireless controller.',
      '## Simple Explanation

A wireless LAN controller, or WLC, manages lightweight access points from one central location. Instead of configuring every AP separately, an administrator can control many APs from the controller. This makes wireless networks easier to manage at scale.

## Key Concepts

- A WLC centrally manages lightweight APs.
- Autonomous APs are managed one by one.
- Lightweight APs are usually managed by a controller.
- Lightweight APs use CAPWAP tunnels to communicate with the WLC.

## Important Points for the CCNA Exam

- Know the difference between autonomous APs and lightweight APs.
- Know that lightweight APs are associated with controller-based wireless design.
- Know that CAPWAP is used between lightweight APs and the WLC.

## Real World Example

A business with dozens of access points across multiple floors can use one WLC to push settings, security policies, and updates across the wireless network instead of logging in to each AP separately.

## Quick Review

- A WLC manages lightweight APs.
- CAPWAP is used between lightweight APs and the controller.
- Centralized management is useful in larger environments.

## Key Terms

- WLC
- Wireless LAN Controller
- Autonomous AP
- Lightweight AP
- CAPWAP

## Mini Practice Questions

1. What is the benefit of using a WLC with lightweight APs?
2. What protocol is commonly used between a lightweight AP and its controller?',
      4,
      10,
      'https://www.youtube.com/watch?v=uX1h0F6wpBY'
    ),
    (
      'network-fundamentals',
      'TCP/IP Model Basics',
      'tcp-ip-model-basics',
      'Learn the five TCP/IP layers and how data is encapsulated as it moves through the network.',
      '## Simple Explanation

The TCP/IP model explains how data moves from one device to another. It organizes communication into layers so each layer has a clear job. This helps network engineers understand protocols, troubleshoot problems, and explain how traffic moves across a network.

## Key Concepts

- Protocols are the rules devices use to communicate.
- Standards help equipment from different vendors work together.
- The TCP/IP model has five layers.
- The Application layer supports communication between applications.
- The Transport layer uses TCP or UDP.
- The Internet layer uses IP for routing between networks.
- The Data Link layer handles local delivery with MAC addresses.
- The Physical layer sends bits over cables or wireless signals.
- Encapsulation adds headers as data moves down the stack.
- Decapsulation removes headers at the receiving side.

## Important Points for the CCNA Exam

- Know the five TCP/IP layers in order.
- Know examples such as HTTP at the Application layer and IP at the Internet layer.
- Understand the difference between local delivery and routed delivery.
- Understand encapsulation and decapsulation clearly.

## Real World Example

When you open a website, the browser creates application data, TCP manages reliable delivery, IP handles addressing and routing, the Data Link layer handles local forwarding, and the Physical layer sends the bits on the medium.

## Quick Review

- TCP/IP has five layers.
- Each layer has a specific role.
- Encapsulation happens before sending.
- Decapsulation happens after receiving.

## Key Terms

- Protocol
- Standard
- Application layer
- Transport layer
- Internet layer
- Data Link layer
- Physical layer
- Encapsulation
- Decapsulation

## Mini Practice Questions

1. Which TCP/IP layer is responsible for routing packets between networks?
2. What happens during encapsulation?',
      5,
      14,
      'https://www.youtube.com/watch?v=yM-XNq9ADlI'
    ),
    (
      'network-fundamentals',
      'Basic Device Security',
      'basic-device-security',
      'Practice the simple router and switch security steps that appear often in CCNA labs.',
      '## Simple Explanation

Basic device security means protecting routers and switches from unauthorized access. Even a few simple settings make a big difference. In CCNA, you should know how to secure privileged access, hide passwords in the configuration, and save your changes.

## Key Concepts

- A hostname identifies the device.
- enable password protects privileged access, but it is weaker.
- enable secret is preferred because it is stored more securely.
- service password-encryption hides plain-text passwords in the config output.
- copy running-config startup-config saves the current configuration.

## Important Points for the CCNA Exam

- enable secret is preferred over enable password.
- Password protection should be part of the basic setup.
- running-config is the active configuration in memory.
- startup-config is the saved configuration used after a reboot.
- Unsaved changes can be lost when the device restarts.

## Real World Example

An administrator configures a branch switch, sets a hostname, adds an enable secret, enables password encryption, and saves the configuration so those settings are still there after a restart.

## Quick Review

- Secure device access starts with basic settings.
- enable secret is more secure than enable password.
- Save the configuration if you want it to survive a reboot.

## Key Terms

- Hostname
- enable password
- enable secret
- service password-encryption
- running-config
- startup-config

## Mini Practice Questions

1. Which command is preferred for securing privileged EXEC access?
2. Which command saves the active configuration so it remains after reboot?',
      6,
      11,
      'https://www.youtube.com/watch?v=SDocmq1c05s'
    ),
    (
      'network-fundamentals',
      'OSI Model Basics',
      'osi-model-basics',
      'Use the seven-layer OSI model to organize protocols and troubleshoot network problems.',
      '## Simple Explanation

The OSI model is a seven-layer reference model used to understand how networking works. It is mainly a conceptual tool, which means it helps you organize protocols and troubleshoot issues in a structured way. It is very important for CCNA study even though real networks do not use the OSI model as a strict implementation guide.

## Key Concepts

- The OSI model has seven layers.
- Layer 1 is Physical.
- Layer 2 is Data Link.
- Layer 3 is Network.
- Layer 4 is Transport.
- Layer 5 is Session.
- Layer 6 is Presentation.
- Layer 7 is Application.
- Different protocols can be associated with different layers.

## Important Points for the CCNA Exam

- You should know the OSI layers in order from 1 to 7 and 7 to 1.
- STP is a Layer 2 protocol.
- OSPF is a Layer 3 protocol.
- DHCP is often discussed at Layer 7 in CCNA-level explanations.
- The OSI model is useful for troubleshooting by narrowing down where a problem exists.

## Real World Example

If two devices cannot communicate, you can use the OSI model to work through the problem. You might first check cabling at Layer 1, switching behavior at Layer 2, and addressing or routing at Layer 3.

## Quick Review

- The OSI model has seven layers.
- It is mainly a conceptual and troubleshooting model.
- Protocols are often described by the layer where they operate.

## Key Terms

- OSI model
- Physical
- Data Link
- Network
- Transport
- Session
- Presentation
- Application

## Mini Practice Questions

1. Which OSI layer is responsible for routing?
2. Which of these is a Layer 2 protocol: STP, OSPF, or DHCP?',
      7,
      13,
      'https://www.youtube.com/watch?v=7nmYoL0t2tU'
    ),
    (
      'network-fundamentals',
      'Introduction to the Cisco CLI',
      'introduction-to-the-cisco-cli',
      'Get comfortable with CLI modes, prompts, and saving configuration on Cisco devices.',
      '## Simple Explanation

The CLI, or command-line interface, is the main way you configure Cisco routers and switches. Instead of using menus, you type commands. For the CCNA, you need to know the main CLI modes, the prompts for each mode, and how to save your configuration.

## Key Concepts

- User EXEC mode is the starting mode and has limited commands.
- Privileged EXEC mode gives access to more commands.
- Global Configuration mode is where you change the device configuration.
- enable moves from User EXEC mode to Privileged EXEC mode.
- configure terminal moves into Global Configuration mode.
- running-config is the active configuration.
- startup-config is the saved configuration.

## Important Points for the CCNA Exam

- Know these prompts:
- Router> means User EXEC mode.
- Router# means Privileged EXEC mode.
- Router(config)# means Global Configuration mode.
- Unsaved changes in running-config can be lost after a reboot.
- Saving the configuration is a core CLI skill.

## Real World Example

A technician connects to a switch, enters privileged mode with enable, enters global configuration mode with configure terminal, changes the hostname, and then saves the running configuration so the change remains after reboot.

## Quick Review

- The CLI is the main Cisco configuration interface.
- Different modes allow different levels of access.
- running-config is active now.
- startup-config is the saved version used after reboot.

## Key Terms

- CLI
- User EXEC mode
- Privileged EXEC mode
- Global Configuration mode
- running-config
- startup-config

## Mini Practice Questions

1. Which command moves you from User EXEC mode to Privileged EXEC mode?
2. What is the difference between running-config and startup-config?',
      8,
      12,
      'https://www.youtube.com/watch?v=IYbtai7Nu2g'
    ),
    (
      $$network-fundamentals$$,
      $$LAN Architectures$$,
      $$lan-architectures$$,
      $$Learn how campus, data center, and small office LAN designs are built and why each topology is used.$$,
      $$## Simple Explanation

LAN architectures describe how devices and switches are arranged inside a local network. Small networks often use one simple device, while larger campus and data center networks use structured designs to improve performance, growth, and reliability.

## Key Concepts

- A LAN connects devices in a limited area such as an office, school, or building.
- A two-tier architecture has an Access layer and a Distribution layer.
- The Access layer connects end devices.
- The Distribution layer collects traffic from access switches and connects toward other networks.
- A three-tier architecture adds a Core layer above the Distribution layer.
- The Core layer focuses on fast forwarding across the network.
- The Core layer should avoid CPU intensive tasks when possible.
- Spine-leaf architecture is mainly used in data centers.
- In spine-leaf, every leaf switch connects to every spine switch.
- Leaf switches do not connect directly to other leaf switches.
- Spine switches do not connect directly to other spine switches.
- Servers usually connect to leaf switches.
- SOHO means Small Office or Home Office.
- A SOHO router often combines routing, switching, firewall, and wireless functions.
- Star topology uses a central device.
- Full mesh means every device connects to every other device.
- Partial mesh means only some devices have multiple paths.
- North-South traffic moves into or out of the network.
- East-West traffic moves inside the network, often between internal devices.

## Important Points for the CCNA Exam

- Know the difference between two-tier and three-tier campus design.
- Know that the Core layer is focused on fast transport.
- Know the basic spine-leaf connection rules.
- Understand what a SOHO network usually looks like.
- Be able to identify star, full mesh, and partial mesh topologies.
- Know the meaning of North-South and East-West traffic.

## Real World Example

A university campus may use a three-tier design. Student devices connect at the Access layer, building switches connect into the Distribution layer, and the Core layer moves traffic quickly between buildings and shared services. A home office usually uses one wireless router that handles many of these jobs in a single box.

## Quick Review

- LAN architectures describe how local networks are built.
- Two-tier and three-tier designs are common in campus networks.
- Spine-leaf is mainly used in data centers.
- SOHO networks are small and usually use one multifunction device.
- Topology terms such as star, mesh, North-South, and East-West are exam important.

## Key Terms

- LAN
- Access layer
- Distribution layer
- Core layer
- Spine-leaf
- SOHO
- Star topology
- Full mesh
- Partial mesh
- North-South traffic
- East-West traffic

## Mini Practice Questions

1. Which layer in a three-tier campus design is focused on fast forwarding?
2. In a spine-leaf design, does a leaf switch connect directly to another leaf switch?
3. What type of device commonly combines routing, switching, firewall, and wireless functions in a SOHO network?$$,
      9,
      13,
      'https://www.youtube.com/watch?v=PvyEcLhmNBk'
    ),
    (
      $$network-fundamentals$$,
      $$WAN Architectures$$,
      $$wan-architectures$$,
      $$Understand the main ways distant sites are connected and how WAN redundancy and VPN designs work.$$,
      $$## Simple Explanation

A WAN connects networks that are far apart, such as offices in different cities. Companies choose different WAN technologies based on cost, performance, security, and reliability needs. For CCNA, you should know the basic WAN options and the main redundancy designs.

## Key Concepts

- WAN stands for Wide Area Network.
- A WAN connects geographically distant networks.
- A leased line is a dedicated point to point connection.
- MPLS uses labels to forward traffic through a provider network.
- MPLS can be used to provide private WAN services.
- CE means Customer Edge router.
- PE means Provider Edge router.
- P means Provider core router.
- Internet connectivity options include DSL, cable, and fiber.
- Single-homed means one connection to one provider.
- Dual-homed usually means two connections to the same provider.
- Multi-homed means connections to multiple providers.
- Dual multi-homed provides multiple links across multiple providers for stronger redundancy.
- A site to site VPN securely connects one site to another site.
- GRE over IPsec combines tunneling with encryption.
- DMVPN supports scalable VPN connectivity.
- Remote access VPN lets an individual user connect securely to a network, often using TLS.

## Important Points for the CCNA Exam

- Know that WANs connect distant sites.
- Understand the difference between leased lines, MPLS, and internet based connectivity.
- Remember the roles of CE, PE, and P in MPLS.
- Know the redundancy terms single-homed, dual-homed, multi-homed, and dual multi-homed.
- Be able to identify the basic VPN types in the CCNA objectives.

## Real World Example

A company with offices in Los Angeles and Dallas may use MPLS or an internet VPN to connect the sites. If the company wants better uptime, it may buy circuits from two providers so one failure does not cut off the branch.

## Quick Review

- WANs connect faraway networks.
- Leased lines are dedicated links.
- MPLS is a provider based WAN technology.
- DSL, cable, and fiber are common internet access methods.
- VPNs provide secure connectivity across shared networks.

## Key Terms

- WAN
- Leased line
- MPLS
- CE
- PE
- P router
- DSL
- Cable
- Fiber
- Single-homed
- Dual-homed
- Multi-homed
- Dual multi-homed
- Site to site VPN
- GRE over IPsec
- DMVPN
- Remote access VPN
- TLS

## Mini Practice Questions

1. What is the main purpose of a WAN?
2. In MPLS, which device sits on the customer side of the provider connection?
3. Which design offers the strongest redundancy: single-homed or dual multi-homed?$$,
      10,
      13,
      'https://www.youtube.com/watch?v=BW3fQgdf4-w'
    ),
    (
      $$network-fundamentals$$,
      $$Interfaces and Cables$$,
      $$interfaces-and-cables$$,
      $$Compare copper and fiber cabling, common connectors, and the cable types used in Ethernet networks.$$,
      $$## Simple Explanation

Devices need physical interfaces and cables to communicate over a wired network. For the CCNA exam, you should know the basic cable categories, when copper or fiber is used, and how straight-through and crossover cables differ.

## Key Concepts

- Ethernet standards define how wired devices communicate.
- UTP means Unshielded Twisted Pair.
- A UTP cable has 8 wires grouped into 4 twisted pairs.
- Copper Ethernet commonly uses an RJ45 connector.
- A straight-through cable is usually used between different device types.
- A crossover cable is usually used between similar device types.
- Auto MDI-X allows devices to adjust cable pair usage automatically.
- Fiber optic cabling uses light instead of electrical signals.
- Multimode fiber is usually cheaper and used for shorter distances.
- Single-mode fiber is usually more expensive and used for longer distances.
- SFP modules allow routers and switches to use fiber links.

## Important Points for the CCNA Exam

- Know the difference between straight-through and crossover cables.
- Know that Auto MDI-X reduces the need to worry about manual cable selection.
- Know that copper Ethernet commonly uses RJ45.
- Know the difference between multimode and single-mode fiber.
- Know that fiber is often used for longer distances or higher speed uplinks.
- Know the purpose of an SFP module.

## Real World Example

A desktop PC connected to an office switch usually uses a copper Ethernet cable with RJ45 connectors. A long building to building link may use fiber and SFP modules because fiber handles distance better than copper.

## Quick Review

- Copper and fiber are the main cable categories.
- Straight-through is usually used for different device types.
- Crossover is usually used for similar device types.
- Fiber is better for longer distance links.
- SFP modules support fiber connectivity on many network devices.

## Key Terms

- Ethernet
- UTP
- RJ45
- Straight-through cable
- Crossover cable
- Auto MDI-X
- Fiber optic cable
- Multimode fiber
- Single-mode fiber
- SFP

## Mini Practice Questions

1. Which connector is commonly used with copper Ethernet cabling?
2. Which type of fiber is usually better for longer distances?
3. What feature allows devices to automatically adjust for cable pair differences?$$,
      11,
      12,
      'https://www.youtube.com/watch?v=ieTH5lVhNaY'
    ),
    (
      $$network-fundamentals$$,
      $$Connecting Devices with the Correct Cable$$,
      $$connecting-devices-with-the-correct-cable$$,
      $$Practice the classic cable selection rules for common device pairings in Packet Tracer and on the CCNA exam.$$,
      $$## Simple Explanation

Choosing the correct cable is a basic networking skill. Modern devices often support Auto MDI-X, but for the CCNA exam you still need to know the traditional cable rules for common device pairings.

## Key Concepts

- PC to switch usually uses a straight-through cable.
- Router to switch usually uses a straight-through cable.
- Switch to switch traditionally uses a crossover cable.
- Similar device types often use crossover cables.
- Different device types often use straight-through cables.
- Fiber is often used for longer distances or optical uplinks.
- Packet Tracer is a useful place to practice cable selection.

## Important Points for the CCNA Exam

- Know the traditional cable selection rules.
- Understand that Auto MDI-X may allow links to work even if the classic rule is not followed.
- Be able to identify which cable type fits common device pairings.
- Remember that fiber is used when copper is not the best fit.

## Real World Example

If you connect a PC to an access switch in an office, you normally use a straight-through cable. If you connect two older switches directly, you may need a crossover cable unless the devices can automatically correct the connection.

## Quick Review

- PC to switch uses straight-through.
- Router to switch uses straight-through.
- Switch to switch traditionally uses crossover.
- Fiber is common for long links.

## Key Terms

- Straight-through
- Crossover
- Auto MDI-X
- Packet Tracer
- Fiber link

## Mini Practice Questions

1. What cable is traditionally used between a PC and a switch?
2. What cable is traditionally used between two switches?
3. Why might fiber be chosen instead of copper for a link?$$,
      12,
      10,
      'https://www.youtube.com/watch?v=K6Qt23sY68Y'
    ),
    (
      $$network-fundamentals$$,
      $$Switch Interfaces and Common Interface Problems$$,
      $$switch-interfaces-and-common-interface-problems$$,
      $$Understand speed, duplex, autonegotiation, and the interface error counters that help identify link issues.$$,
      $$## Simple Explanation

Switch interfaces are the ports where network cables connect to a switch. These interfaces matter at both Layer 1 and Layer 2. Problems with speed, duplex, or negotiation can lead to poor performance and interface errors.

## Key Concepts

- Switch interfaces operate at Layer 1 and Layer 2.
- Interfaces can run at speeds such as 10 Mbps, 100 Mbps, and 1 Gbps.
- Half duplex means a device cannot send and receive at the same time.
- Full duplex means a device can send and receive at the same time.
- Autonegotiation allows devices to choose the best speed and duplex automatically.
- A duplex mismatch happens when each side uses a different duplex setting.
- Common interface issues include CRC errors, runts, giants, input errors, and output errors.
- show interfaces status gives a fast summary of switch ports.

## Important Points for the CCNA Exam

- Know the meaning of speed and duplex.
- Know why full duplex is preferred on modern Ethernet links.
- Understand what autonegotiation does.
- Know that a duplex mismatch can cause performance and error problems.
- Recognize common interface error terms such as CRC, runts, and giants.
- Know when to use show interfaces status.

## Real World Example

A user reports a slow connection even though the link light is on. The switch shows interface errors because one side of the link is using half duplex while the other side is using full duplex. Fixing the duplex settings restores normal communication.

## Quick Review

- Switch ports work at Layer 1 and Layer 2.
- Speed and duplex settings affect performance.
- Autonegotiation helps devices choose settings.
- Duplex mismatches can create errors and slowness.
- Interface counters help identify link problems.

## Key Terms

- Interface
- Speed
- Duplex
- Half duplex
- Full duplex
- Autonegotiation
- Duplex mismatch
- CRC errors
- Runts
- Giants
- Input errors
- Output errors

## Mini Practice Questions

1. What is the difference between half duplex and full duplex?
2. What problem occurs when two sides of a link use different duplex settings?
3. Which command gives a quick summary of switch interface status?$$,
      13,
      12,
      'https://www.youtube.com/watch?v=cCqluocfQe0'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring Router and Switch Interfaces$$,
      $$configuring-router-and-switch-interfaces$$,
      $$Practice the common interface tasks used in CCNA labs, including descriptions, speed, duplex, and saving changes.$$,
      $$## Simple Explanation

Network engineers configure interfaces so devices can communicate correctly. Common tasks include setting descriptions, assigning IP addresses where needed, adjusting speed and duplex, shutting down unused ports, and saving the configuration.

## Key Concepts

- Interfaces are configured from the CLI.
- Common interface tasks include assigning IP addresses on router interfaces.
- The description command adds a useful label to an interface.
- The speed command sets interface speed manually.
- The duplex command sets interface duplex manually.
- The interface range command helps configure multiple ports at once.
- Unused switch ports are often shut down for security and control.
- Saving the configuration keeps changes after a reboot.

## Important Points for the CCNA Exam

- Know why interface descriptions are useful.
- Know how interface range saves time.
- Know that speed and duplex can be configured manually if needed.
- Know that unused ports are often disabled.
- Remember that unsaved changes are lost after reload.

## Real World Example

A network administrator configures access switch ports for a classroom. They add descriptions such as PC-Row-1, shut down unused ports, and verify the active ports are operating correctly. These small steps make future troubleshooting much easier.

## Quick Review

- Interface configuration is a core CCNA skill.
- Descriptions improve documentation and troubleshooting.
- interface range helps configure many ports quickly.
- Unused ports are often shut down.
- Save changes so they remain after a reboot.

## Key Terms

- Interface range
- Description
- Speed
- Duplex
- Shutdown
- Running-config
- Startup-config

## Mini Practice Questions

1. Which command helps you configure multiple interfaces at once?
2. Why is the description command useful?
3. Why might an unused switch port be shut down?$$,
      14,
      11,
      'https://www.youtube.com/watch?v=rzDb5DoBKRk'
    ),
    (
      $$network-fundamentals$$,
      $$Comparing TCP and UDP$$,
      $$comparing-tcp-and-udp$$,
      $$Compare the two main Transport layer protocols and learn which common applications use each one.$$,
      $$## Simple Explanation

TCP and UDP are Transport layer protocols that help applications send data across a network. TCP focuses on reliability and ordered delivery, while UDP focuses on speed and low overhead.

## Key Concepts

- TCP and UDP operate at Layer 4.
- TCP is connection oriented.
- TCP uses a three-way handshake.
- TCP provides reliability, acknowledgments, sequencing, and flow control.
- The minimum TCP header size is 20 bytes.
- UDP is connectionless.
- UDP does not use a handshake.
- UDP does not provide retransmission or sequencing.
- The UDP header size is 8 bytes.
- Common TCP applications include HTTP, HTTPS, FTP, SMTP, and SSH.
- Common UDP applications include DNS, VoIP, video streaming, and DHCP.
- Important ports include HTTP 80, HTTPS 443, FTP 20 and 21, SSH 22, DNS 53, and DHCP 67 and 68.

## Important Points for the CCNA Exam

- Know that TCP is reliable and connection oriented.
- Know that UDP is connectionless and faster with less overhead.
- Understand the basic idea of the TCP three-way handshake.
- Know which common applications use TCP and which use UDP.
- Memorize the important port numbers listed in the objective.

## Real World Example

When you load a secure website, TCP is used because the data needs reliable delivery. During a voice call, UDP is often used because fast delivery matters more than resending missing packets.

## Quick Review

- TCP is reliable and connection oriented.
- UDP is lightweight and connectionless.
- TCP uses acknowledgments and sequencing.
- UDP is often chosen when speed matters more than recovery.
- Port numbers are important for the CCNA exam.

## Key Terms

- TCP
- UDP
- Three-way handshake
- Reliability
- Acknowledgment
- Sequencing
- Flow control
- Connection oriented
- Connectionless
- Port number

## Mini Practice Questions

1. Which protocol uses a three-way handshake: TCP or UDP?
2. Which protocol is more likely to be used for voice or video traffic where speed matters most?
3. What port does HTTPS use?$$,
      15,
      14,
      'https://www.youtube.com/watch?v=LIEACBqlntY'
    ),
    (
      $$network-fundamentals$$,
      $$IPv4 Addressing Fundamentals$$,
      $$ipv4-addressing-fundamentals$$,
      $$Learn how IPv4 addresses are structured, how classes work, and how network, host, and special addresses are identified.$$,
      $$## Simple Explanation

IPv4 addresses are logical addresses used to identify devices on a network. Each IPv4 address has 32 bits and is written as four decimal numbers separated by dots. For the CCNA exam, you should be comfortable reading IPv4 addresses and understanding what part identifies the network and what part identifies the host.

## Key Concepts

- IPv4 is a 32-bit logical addressing system.
- An IPv4 address is made of 4 octets.
- Each octet contains 8 bits.
- Example IPv4 address: 192.168.1.10
- An address has a network portion and a host portion.
- Class A addresses start from 1 to 126 in the first octet.
- Class B addresses start from 128 to 191 in the first octet.
- Class C addresses start from 192 to 223 in the first octet.
- The network address has all host bits set to 0.
- The broadcast address has all host bits set to 1.
- Loopback addresses use 127.0.0.0/8.

## Important Points for the CCNA Exam

- Know that IPv4 addresses are 32 bits long.
- Know that IPv4 addresses are written in dotted decimal format.
- Be able to identify Class A, B, and C ranges at a basic level.
- Know the meaning of network address and broadcast address.
- Remember that 127.0.0.0/8 is used for loopback testing.

## Real World Example

If a PC has the address 192.168.10.25 with a /24 mask, the network is 192.168.10.0 and the broadcast is 192.168.10.255. The PC uses the host portion to identify itself uniquely on that network.

## Quick Review

- IPv4 uses 32-bit addresses.
- Each address has 4 octets.
- Some bits identify the network and some identify the host.
- Network and broadcast addresses are special and cannot be assigned to hosts.
- Loopback addresses are used for local testing.

## Key Terms

- IPv4
- Octet
- Dotted decimal
- Network portion
- Host portion
- Network address
- Broadcast address
- Loopback
- Class A
- Class B
- Class C

## Mini Practice Questions

1. How many bits are in an IPv4 address?
2. What special address has all host bits set to 1?
3. Which class range includes addresses beginning with 192?$$,
      16,
      13,
      'https://youtu.be/3ROdsfEUuhs?si=t19Rx8gjfZs2gje2'
    ),
    (
      $$network-fundamentals$$,
      $$IPv4 Header Basics$$,
      $$ipv4-header-basics$$,
      $$Understand the most important IPv4 header fields and why they matter when packets move across a network.$$,
      $$## Simple Explanation

When a device sends an IPv4 packet, extra information is added to the front of the data. This information is called the IPv4 header. The header helps routers and hosts know where the packet is going, how it should be handled, and whether it needs fragmentation.

## Key Concepts

- An IPv4 packet includes a header and payload.
- TTL means Time To Live.
- TTL helps prevent packets from looping forever.
- The Protocol field identifies the next Layer 4 protocol, such as TCP or UDP.
- The Identification field helps manage fragmentation.
- The Fragment Offset field shows the position of a fragment in the original packet.
- Routers examine header fields to make forwarding decisions.

## Important Points for the CCNA Exam

- Know that TTL helps stop routing loops.
- Know that the Protocol field identifies TCP, UDP, and other upper-layer protocols.
- Know that Identification and Fragment Offset are used for fragmentation.
- Be able to describe the purpose of header fields in simple exam language.

## Real World Example

If a packet is too large for a link, it may be fragmented. The Identification field helps show that the pieces belong together, and the Fragment Offset helps the receiving device place them back in the correct order.

## Quick Review

- The IPv4 header carries control information for the packet.
- TTL prevents packets from circulating forever.
- Protocol identifies the transport protocol.
- Fragment-related fields help manage packet fragmentation.

## Key Terms

- IPv4 header
- TTL
- Protocol field
- Identification
- Fragment Offset
- Fragmentation
- Packet
- Payload

## Mini Practice Questions

1. Which IPv4 header field helps prevent routing loops?
2. Which field identifies whether the packet contains TCP or UDP?
3. Which two header fields are most closely tied to fragmentation?$$,
      17,
      10,
      'https://youtu.be/aQB22y4liXA?si=C_UTFOgMgHTVdxTQ'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv4 Addresses$$,
      $$configuring-and-verifying-ipv4-addresses$$,
      $$Practice assigning IPv4 addresses to router interfaces and verifying the configuration with common IOS commands.$$,
      $$## Simple Explanation

Routers need IP addresses on their interfaces so they can communicate with other devices and route traffic between networks. After assigning an address, the interface must be enabled and then verified to make sure the configuration is working.

## Key Concepts

- Router interfaces are configured from interface configuration mode.
- The ip address command assigns an IPv4 address and subnet mask.
- The no shutdown command enables the interface.
- show ip interface brief is a common verification command.
- An interface must have the correct address, mask, and operational state.

## Important Points for the CCNA Exam

- Know the syntax of ip address [ip] [subnet mask].
- Remember that a router interface is administratively down until enabled.
- Know that no shutdown is required on router interfaces in many lab scenarios.
- Know how to use show ip interface brief to verify address and status.

## Real World Example

An administrator configures a router interface with 192.168.1.1 255.255.255.0, enters no shutdown, and then checks show ip interface brief to confirm the interface is up with the correct address.

## Quick Review

- Router interfaces need valid IPv4 addresses.
- The ip address command sets the address and mask.
- no shutdown enables the interface.
- show ip interface brief is a fast way to verify interface settings.

## Key Terms

- ip address
- Subnet mask
- no shutdown
- Interface status
- show ip interface brief
- Router interface

## Mini Practice Questions

1. Which command assigns an IPv4 address to a router interface?
2. Which command enables a router interface that is administratively down?
3. Which verification command gives a quick summary of interface addressing and status?$$,
      18,
      11,
      'https://youtu.be/e1jbvyMeS5I?si=Kr0LWZrhw5gFNV1O'
    ),
    (
      $$network-fundamentals$$,
      $$Subnetting Fundamentals$$,
      $$subnetting-fundamentals$$,
      $$Learn how prefix lengths, borrowed bits, and host bits are used to calculate subnets and usable hosts.$$,
      $$## Simple Explanation

Subnetting divides a larger network into smaller networks. This helps organize addresses, reduce broadcast size, and use address space more efficiently. For CCNA, you need to understand prefix lengths, how many subnets are created, and how many hosts fit inside each subnet.

## Key Concepts

- CIDR uses flexible prefix lengths such as /24 or /27.
- Borrowed bits are bits taken from the host portion to create more subnets.
- Host bits are the bits left for host addresses.
- Number of subnets = 2 raised to the number of borrowed bits.
- Usable hosts = 2 raised to the number of host bits minus 2.
- The minus 2 accounts for the network address and broadcast address.
- Smaller subnets provide fewer hosts but more subnetworks.

## Important Points for the CCNA Exam

- Know what a prefix length means.
- Be able to calculate the number of subnets from borrowed bits.
- Be able to calculate usable hosts from host bits.
- Know why two addresses in each subnet are reserved in normal IPv4 subnetting.
- Be comfortable moving between subnet masks and prefix lengths.

## Real World Example

If a network uses /27 instead of /24, it creates smaller subnets with fewer hosts in each one. This can help separate departments or buildings while using the address range more efficiently.

## Quick Review

- Subnetting breaks a larger network into smaller pieces.
- CIDR uses flexible prefix lengths.
- Borrowed bits create more subnets.
- Host bits determine how many usable hosts fit in each subnet.
- Network and broadcast addresses are reserved.

## Key Terms

- Subnetting
- CIDR
- Prefix length
- Borrowed bits
- Host bits
- Subnet mask
- Usable hosts
- Network address
- Broadcast address

## Mini Practice Questions

1. What does CIDR allow you to change more flexibly than classful addressing?
2. How do you calculate the number of subnets created from borrowed bits?
3. Why do we subtract 2 when calculating usable IPv4 hosts in a normal subnet?$$,
      19,
      15,
      'https://youtu.be/bQ8sdpGQu8c?si=cHT2_5btzF4pqiAC'
    ),
    (
      $$network-fundamentals$$,
      $$VLSM and Advanced Subnetting$$,
      $$vlsm-and-advanced-subnetting$$,
      $$Use Variable Length Subnet Masking to assign different subnet sizes efficiently and avoid wasted address space.$$,
      $$## Simple Explanation

VLSM, or Variable Length Subnet Masking, lets you use different subnet sizes inside the same larger address block. This is useful because not every network needs the same number of hosts. The main rule is to assign addresses to the largest subnet first, then work downward.

## Key Concepts

- VLSM stands for Variable Length Subnet Masking.
- VLSM allows different subnet sizes within one address range.
- Larger networks should be allocated first.
- VLSM reduces wasted address space.
- Good subnet planning depends on counting hosts before assigning prefixes.

## Important Points for the CCNA Exam

- Know that VLSM allows different subnet sizes in the same design.
- Remember the rule: allocate the largest subnet first.
- Be able to explain why VLSM is more efficient than forcing every subnet to be the same size.
- Expect VLSM style subnetting problems on the CCNA exam.

## Real World Example

If one department needs 50 hosts and another needs only 10, VLSM lets you give the larger department a bigger subnet and the smaller department a smaller subnet instead of wasting addresses on both.

## Quick Review

- VLSM uses different subnet sizes in one addressing plan.
- It helps prevent wasted addresses.
- You should always assign the biggest subnet first.
- Careful planning makes subnetting easier and cleaner.

## Key Terms

- VLSM
- Variable Length Subnet Masking
- Prefix
- Address planning
- Host requirement
- Subnet efficiency

## Mini Practice Questions

1. What does VLSM allow you to do that fixed-size subnetting does not?
2. When planning VLSM, which subnet should be allocated first?
3. Why is VLSM useful in real networks?$$,
      20,
      13,
      'https://youtu.be/z-JqCedc9EI?si=dFi3yi9tUqaze0dl'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Addressing Fundamentals$$,
      $$ipv6-addressing-fundamentals$$,
      $$Learn how IPv6 addresses are written, shortened, and grouped into the main address types used on modern networks.$$,
      $$## Simple Explanation

IPv6 was created to provide a much larger address space than IPv4. IPv6 addresses are 128 bits long and are written in hexadecimal. They look different from IPv4 addresses, but the main goal is the same: to identify devices on a network.

## Key Concepts

- IPv6 uses 128-bit addresses.
- IPv6 addresses are written in hexadecimal.
- An IPv6 address is separated into blocks by colons.
- Leading zeros can be removed from each block.
- One continuous sequence of zero blocks can be shortened with double colon.
- Global Unicast addresses are used on the public internet.
- Unique Local addresses are used for private internal communication.
- Link Local addresses are used only on the local network segment.

## Important Points for the CCNA Exam

- Know that IPv6 addresses are 128 bits long.
- Know the basic shortening rules for IPv6 notation.
- Remember that you can use double colon only once in a written IPv6 address.
- Know the main IPv6 address types and their prefixes.

## Real World Example

A company may assign Global Unicast IPv6 addresses for routed communication, while every interface also automatically uses a Link Local address to communicate on the local segment.

## Quick Review

- IPv6 uses hexadecimal instead of dotted decimal.
- Leading zeros can be removed.
- One zero sequence can be replaced with double colon.
- Global Unicast, Unique Local, and Link Local are key IPv6 address types.

## Key Terms

- IPv6
- Hexadecimal
- Global Unicast
- Unique Local
- Link Local
- Leading zeros
- Double colon

## Mini Practice Questions

1. How many bits are in an IPv6 address?
2. Can the double colon shortcut be used more than once in the same IPv6 address?
3. Which IPv6 address type is meant for local segment communication only?$$,
      21,
      13,
      'https://youtu.be/ZNuXyOXae5U?si=tMiALwm3pZAxxRmn'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Neighbor Discovery and Address Types$$,
      $$ipv6-neighbor-discovery-and-address-types$$,
      $$Understand how IPv6 devices discover neighbors and how key IPv6 address types are used in real networks.$$,
      $$## Simple Explanation

IPv6 does not use ARP like IPv4 does. Instead, it uses Neighbor Discovery Protocol, or NDP, which relies on ICMPv6 messages. NDP helps devices learn about neighbors, routers, and addressing information on the local network.

## Key Concepts

- NDP stands for Neighbor Discovery Protocol.
- NDP replaces ARP in IPv6 networks.
- Neighbor Solicitation is used to ask about a neighboring IPv6 device.
- Neighbor Advertisement is used to reply with address information.
- SLAAC stands for Stateless Address Auto Configuration.
- SLAAC allows hosts to build their own IPv6 addresses using router advertisements.
- Global Unicast addresses use the 2000::/3 range.
- Unique Local addresses use the FD00::/7 range.
- Link Local addresses use the FE80::/10 range.

## Important Points for the CCNA Exam

- Know that NDP replaces ARP in IPv6.
- Know the roles of Neighbor Solicitation and Neighbor Advertisement.
- Understand the basic idea of SLAAC.
- Be able to match the main IPv6 address types to their prefixes.

## Real World Example

When a new host joins an IPv6 network, it can use router advertisements to learn the network prefix and then build its own address with SLAAC. It can then use NDP messages to find nearby devices on the link.

## Quick Review

- NDP is the IPv6 replacement for ARP.
- ICMPv6 carries NDP messages.
- Neighbor Solicitation and Neighbor Advertisement help devices find each other.
- SLAAC lets hosts create their own IPv6 addresses.
- Prefixes help identify the main IPv6 address types.

## Key Terms

- NDP
- ICMPv6
- Neighbor Solicitation
- Neighbor Advertisement
- SLAAC
- Router Advertisement
- Global Unicast
- Unique Local
- Link Local

## Mini Practice Questions

1. What protocol replaces ARP in IPv6?
2. Which ICMPv6 message is used to respond to a neighbor lookup?
3. What does SLAAC allow a host to do?$$,
      22,
      13,
      'https://youtu.be/rwkHfsWQwy8?si=b9F5AV89HMvk5euB'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv6 Addresses$$,
      $$configuring-and-verifying-ipv6-addresses$$,
      $$Practice enabling IPv6 routing, assigning IPv6 addresses, and verifying that interfaces are ready to carry IPv6 traffic.$$,
      $$## Simple Explanation

Routers need IPv6 addresses on their interfaces before they can route IPv6 traffic. In Cisco IOS, IPv6 routing must also be enabled globally. After configuration, you should verify the interface addresses and status just like you do with IPv4.

## Key Concepts

- IPv6 routing must be enabled with ipv6 unicast-routing.
- Interfaces can be assigned static IPv6 addresses.
- Link Local and Global Unicast addresses may both be present on an interface.
- Verification is important after configuration.
- Floating static routes can be used as backup routes by giving them a higher administrative distance.

## Important Points for the CCNA Exam

- Remember to enable ipv6 unicast-routing before routing IPv6 traffic.
- Know that IPv6 interfaces can have more than one address type.
- Know the purpose of a floating static route.
- Be ready to verify interface addressing in IPv6 lab scenarios.

## Real World Example

An administrator enables ipv6 unicast-routing on a router, assigns a Global Unicast address to an interface, and then checks the interface to confirm the address is present before testing connectivity to another IPv6 network.

## Quick Review

- IPv6 routing must be enabled first on the router.
- Interfaces can carry both Link Local and Global Unicast addresses.
- Floating static routes are backup routes.
- Verification is an important part of IPv6 configuration.

## Key Terms

- ipv6 unicast-routing
- Global Unicast
- Link Local
- Static route
- Floating static route
- Administrative distance
- IPv6 interface

## Mini Practice Questions

1. Which command enables IPv6 routing on a Cisco router?
2. What is the purpose of a floating static route?
3. Can an IPv6 interface have both a Link Local and a Global Unicast address?$$,
      23,
      11,
      'https://youtu.be/WSBEVFANMmc?si=nCh39q6IO-eA0MPS'
    ),
    (
      $$network-fundamentals$$,
      $$Verifying IP Parameters on Client Operating Systems$$,
      $$verifying-ip-parameters-on-client-operating-systems$$,
      $$Use common Windows, macOS, and Linux commands to check addressing, gateways, DNS settings, and connectivity.$$,
      $$## Simple Explanation

A client device must have correct IP settings before it can communicate on the network. When troubleshooting, you should check the IP address, subnet mask, default gateway, and DNS settings first. Different operating systems use different commands, but the goal is the same.

## Key Concepts

- Important client IP settings include IP address, subnet mask, default gateway, and DNS server.
- Windows commonly uses ipconfig and ipconfig /all.
- macOS commonly uses ifconfig and networksetup.
- Linux commonly uses ip addr and ifconfig.
- ping tests basic connectivity.
- traceroute helps show the path traffic takes across a network.

## Important Points for the CCNA Exam

- Know which commands are commonly used on Windows, macOS, and Linux.
- Know which parameters should be checked first during troubleshooting.
- Understand that ping tests reachability.
- Understand that traceroute helps identify where a path problem may exist.

## Real World Example

A user cannot open websites. A technician checks the client and finds the IP address is correct, but the default gateway is wrong. After correcting the gateway, the user can reach remote networks again.

## Quick Review

- Client devices need correct IP settings to communicate.
- Different operating systems use different verification commands.
- ping checks reachability.
- traceroute helps find where a path issue is happening.

## Key Terms

- IP address
- Subnet mask
- Default gateway
- DNS server
- ipconfig
- ifconfig
- networksetup
- ip addr
- ping
- traceroute

## Mini Practice Questions

1. Which Windows command gives detailed IP configuration information?
2. Which command is commonly used on Linux to view interface addressing?
3. What is the purpose of traceroute?$$,
      24,
      10,
      'https://youtu.be/e1jbvyMeS5I?si=Kr0LWZrhw5gFNV1O'
    ),
    (
      'network-access',
      'Switching Concepts and VLAN Segmentation',
      'switching-concepts-vlan-segmentation',
      'Learn how switches forward frames and how VLANs isolate traffic domains.',
      'Switches use MAC learning and forwarding tables to optimize traffic flow. VLAN segmentation separates broadcast domains and improves both performance and security boundaries. Production networks typically pair VLAN design with IP addressing standards and route policy from day one.',
      1,
      17,
      null
    ),
    (
      'network-access',
      'Trunks and Inter-VLAN Routing',
      'trunks-and-intervlan-routing',
      'Configure trunk links and understand how traffic moves between VLANs.',
      'Trunk links carry multiple VLAN tags across a single interface. Inter-VLAN routing is usually handled by a Layer 3 switch or router-on-a-stick design in smaller environments. Validate native VLAN consistency and allowed VLAN lists to avoid hard-to-trace reachability issues.',
      2,
      22,
      null
    ),
    (
      'ip-connectivity',
      'Static Routing and Default Routes',
      'static-routing-and-default-routes',
      'Use static routes intentionally and understand where default routes belong.',
      'Static routes are reliable for predictable paths and edge scenarios. Default routes simplify branch deployments but should be paired with upstream resiliency checks. Always confirm recursive next-hop resolution and verify forwarding with traceroute before rollout.',
      1,
      16,
      null
    ),
    (
      'ip-connectivity',
      'OSPF Single-Area Fundamentals',
      'ospf-single-area-fundamentals',
      'Understand neighbor states, LSAs, and route selection inside a single area.',
      'OSPF builds adjacency using hello and dead timers, then floods LSAs to build a synchronized topology view. Keep interface costs intentional and document router IDs early. Troubleshooting usually starts with adjacency state, then moves to SPF calculations and route installation checks.',
      2,
      24,
      null
    ),
    (
      'ip-services',
      'NAT and PAT Essentials',
      'nat-and-pat-essentials',
      'Translate private addressing to public space with predictable policy behavior.',
      'NAT and PAT preserve address space and control external exposure. Always verify translation order against ACL and route-map logic. Clear operational baselines include translation table checks, session counts, and timeout behavior during failover events.',
      1,
      19,
      null
    ),
    (
      'ip-services',
      'DHCP and NTP Operational Basics',
      'dhcp-and-ntp-operational-basics',
      'Deliver addresses dynamically and maintain consistent time across network devices.',
      'DHCP ensures scalable endpoint provisioning while NTP keeps logs and authentication systems trustworthy. In distributed environments, configure reliable time sources and monitor stratum stability. Clock drift is a frequent root cause for troubleshooting confusion.',
      2,
      15,
      null
    ),
    (
      'security-fundamentals',
      'Device Hardening and Secure Management',
      'device-hardening-and-secure-management',
      'Apply baseline controls for SSH, credentials, banners, and management plane access.',
      'Network hardening starts with removing unnecessary services and enforcing secure management protocols. Restrict management access with ACLs and dedicated VLANs. Audit changes regularly and standardize hardening templates to reduce drift across devices.',
      1,
      18,
      null
    ),
    (
      'security-fundamentals',
      'Access Control Lists Foundations',
      'access-control-lists-foundations',
      'Design and place ACLs correctly to control traffic without breaking application flow.',
      'ACL effectiveness depends on placement and order. Standard ACLs are usually positioned near destination, while extended ACLs are often placed close to source. Track explicit permit/deny decisions and validate with controlled test traffic before deploying broadly.',
      2,
      21,
      null
    ),
    (
      'automation-and-programmability',
      'Controller-Based Networking Concepts',
      'controller-based-networking-concepts',
      'Understand intent-based architecture, controllers, and policy-driven operations.',
      'Controller-based networks centralize configuration and telemetry workflows. Teams shift from per-device CLI changes to policy intent and template lifecycles. Strong source-of-truth practices become critical to avoid drift between controller state and actual device state.',
      1,
      16,
      null
    ),
    (
      'automation-and-programmability',
      'APIs, JSON, and Automation Workflows',
      'apis-json-and-automation-workflows',
      'Use API-driven methods to retrieve data and automate repeatable network tasks.',
      'Modern network automation relies on API requests, structured JSON payloads, and idempotent scripts. Start with read-only data collection, then progress to controlled configuration workflows. Logging, retries, and rollback strategy are mandatory for production automation.',
      2,
      23,
      'https://example.com/ccna/automation-intro'
    )
) as l(module_slug, title, slug, summary, content, order_index, estimated_minutes, video_url)
  on l.module_slug = m.slug
where m.course_id = (
  select id
  from public.courses
  where slug = 'ccna-200-301-preparation'
)
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url;


-- Phase 31: Interactive subnetting trainer foundation
-- Source: supabase\migrations\20260319_phase31_subnetting_trainer_foundation.sql

create table if not exists public.subnetting_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  network text not null,
  prefix integer not null check (prefix >= 0 and prefix <= 32),
  correct boolean not null default false,
  score integer not null default 0 check (score >= 0 and score <= 100),
  time_taken integer not null default 0 check (time_taken >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_subnetting_attempts_user_id
  on public.subnetting_attempts(user_id);

create index if not exists idx_subnetting_attempts_created_at
  on public.subnetting_attempts(created_at desc);

alter table public.subnetting_attempts enable row level security;

drop policy if exists "subnetting_attempts_select_own" on public.subnetting_attempts;
create policy "subnetting_attempts_select_own"
on public.subnetting_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "subnetting_attempts_insert_own" on public.subnetting_attempts;
create policy "subnetting_attempts_insert_own"
on public.subnetting_attempts
for insert
to authenticated
with check (auth.uid() = user_id);


-- Phase 32: AI tutor foundation
-- Source: supabase\migrations\20260319_phase32_ai_tutor_foundation.sql

create table if not exists public.ai_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  response text not null,
  lesson_context text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ai_tutor_sessions_user_id
  on public.ai_tutor_sessions(user_id);

create index if not exists idx_ai_tutor_sessions_created_at
  on public.ai_tutor_sessions(created_at desc);

alter table public.ai_tutor_sessions enable row level security;

drop policy if exists "ai_tutor_sessions_select_own" on public.ai_tutor_sessions;
create policy "ai_tutor_sessions_select_own"
on public.ai_tutor_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ai_tutor_sessions_insert_own" on public.ai_tutor_sessions;
create policy "ai_tutor_sessions_insert_own"
on public.ai_tutor_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

update public.lessons
set is_published = true
where module_id = (
  select id
  from public.modules
  where slug = 'network-fundamentals'
    and course_id = (
      select id
      from public.courses
      where slug = 'ccna-200-301-preparation'
    )
)
and slug in (
  'network-devices-and-their-roles',
  'lan-architectures',
  'interfaces-and-cables',
  'switch-interfaces-and-common-interface-problems',
  'private-ipv4-addressing',
  'ipv6-addressing-fundamentals',
  'ipv6-neighbor-discovery-and-address-types',
  'ipv6-anycast-multicast-and-modified-eui-64',
  'ipv6-neighbor-discovery-and-slaac',
  'configuring-and-verifying-ipv6-addresses',
  'verifying-ip-parameters-on-client-operating-systems',
  'wireless-fundamentals',
  'wifi-channels-and-ssid-basics',
  'wireless-security',
  'virtualization-and-cloud-fundamentals',
  'containers-fundamentals',
  'vrf-fundamentals',
  'ethernet-lan-switching-fundamentals',
  'ethernet-switching-forwarding-and-flooding',
  'analyzing-ethernet-switching-arp-and-ping'
);


-- ==============================
-- Phase 3: Quiz foundation
-- Source: supabase\migrations\20260308_phase3_quiz_foundation.sql
-- ==============================
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  check (
    (module_id is not null and lesson_id is null) or
    (module_id is null and lesson_id is not null)
  )
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  explanation text not null default '',
  difficulty text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard')),
  order_index integer not null check (order_index > 0),
  question_type text not null default 'single_choice'
    check (question_type in ('single_choice')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (quiz_id, order_index)
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (question_id, order_index)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  total_questions integer not null check (total_questions >= 0),
  correct_answers integer not null check (correct_answers >= 0),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null
);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_id uuid null references public.question_options(id) on delete set null,
  is_correct boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (quiz_attempt_id, question_id)
);

create index if not exists idx_quizzes_module_id on public.quizzes(module_id);
create index if not exists idx_quizzes_lesson_id on public.quizzes(lesson_id);
create index if not exists idx_quizzes_is_published on public.quizzes(is_published);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_question_options_question_id on public.question_options(question_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);
create index if not exists idx_quiz_attempt_answers_attempt_id on public.quiz_attempt_answers(quiz_attempt_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.question_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

drop policy if exists "quizzes_select_published_authenticated" on public.quizzes;
create policy "quizzes_select_published_authenticated"
on public.quizzes
for select
to authenticated
using (is_published = true);

revoke select on public.quiz_questions from authenticated;

revoke select on public.question_options from authenticated;

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own"
on public.quiz_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "quiz_attempt_answers_select_own" on public.quiz_attempt_answers;
create policy "quiz_attempt_answers_select_own"
on public.quiz_attempt_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_attempts qa
    where qa.id = quiz_attempt_id
      and qa.user_id = auth.uid()
  )
);

drop policy if exists "quiz_attempt_answers_insert_own" on public.quiz_attempt_answers;
create policy "quiz_attempt_answers_insert_own"
on public.quiz_attempt_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.quiz_attempts qa
    where qa.id = quiz_attempt_id
      and qa.user_id = auth.uid()
  )
);

grant select on public.quizzes to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant select, insert on public.quiz_attempt_answers to authenticated;

-- ==============================
-- Phase 3: CCNA quiz seed data
-- Source: supabase\seeds\20260308_ccna_quiz_seed.sql
-- ==============================
insert into public.quizzes (
  module_id,
  lesson_id,
  title,
  slug,
  description,
  is_published
)
select
  m.id,
  null,
  x.title,
  x.slug,
  x.description,
  true
from public.modules m
join (
  values
    ('network-fundamentals', 'Network Fundamentals Quiz', 'network-fundamentals-quiz', 'Check your understanding of core models, addressing, and media concepts.'),
    ('network-access', 'Network Access Quiz', 'network-access-quiz', 'Review VLANs, switching behavior, and trunking fundamentals.'),
    ('ip-connectivity', 'IP Connectivity Quiz', 'ip-connectivity-quiz', 'Practice routing and OSPF reasoning with CCNA-style scenarios.'),
    ('ip-services', 'IP Services Quiz', 'ip-services-quiz', 'Validate your grasp of DHCP, NAT, NTP, and supporting services.'),
    ('security-fundamentals', 'Security Fundamentals Quiz', 'security-fundamentals-quiz', 'Test secure management, ACL logic, and baseline hardening concepts.'),
    ('automation-and-programmability', 'Automation and Programmability Quiz', 'automation-and-programmability-quiz', 'Practice API, controller, and automation workflow fundamentals.')
) as x(module_slug, title, slug, description)
  on x.module_slug = m.slug
on conflict (slug) do update
set
  module_id = excluded.module_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  description = excluded.description,
  is_published = excluded.is_published;

insert into public.quiz_questions (
  quiz_id,
  question_text,
  explanation,
  difficulty,
  order_index,
  question_type
)
select
  q.id,
  x.question_text,
  x.explanation,
  x.difficulty,
  x.order_index,
  'single_choice'
from public.quizzes q
join (
  values
    ('network-fundamentals-quiz', 1, 'Which layer is primarily responsible for end-to-end session reliability in the TCP/IP model?', 'Transport layer services provide sequencing, acknowledgments, and reliability features such as retransmission in TCP.', 'easy'),
    ('network-fundamentals-quiz', 2, 'What is the main reason subnetting is used in an enterprise network?', 'Subnetting reduces broadcast scope and supports structured address allocation, policy boundaries, and growth planning.', 'easy'),
    ('network-fundamentals-quiz', 3, 'Which statement best describes IPv6 compared with IPv4?', 'IPv6 expands address space substantially and changes operational assumptions around addressing and neighbor discovery.', 'medium'),

    ('network-access-quiz', 1, 'What is the primary function of a VLAN on a switch?', 'A VLAN creates a separate Layer 2 broadcast domain, allowing traffic segmentation on shared switching infrastructure.', 'easy'),
    ('network-access-quiz', 2, 'Why is a trunk port required between two switches in a multi-VLAN design?', 'A trunk carries traffic for multiple VLANs over one link using frame tagging.', 'easy'),
    ('network-access-quiz', 3, 'Which design concern is most important when configuring native VLANs on both sides of a trunk?', 'Native VLAN mismatches can create unexpected forwarding behavior and troubleshooting confusion.', 'medium'),

    ('ip-connectivity-quiz', 1, 'When is a default route most useful?', 'A default route is useful when a device should send unknown destinations to a general upstream path.', 'easy'),
    ('ip-connectivity-quiz', 2, 'What must happen before OSPF routers exchange full topology information?', 'Routers must first establish a neighbor adjacency by matching key OSPF parameters.', 'medium'),
    ('ip-connectivity-quiz', 3, 'What is the main benefit of dynamic routing over static routing in larger environments?', 'Dynamic routing adapts to topology changes with less manual intervention than static route maintenance.', 'medium'),

    ('ip-services-quiz', 1, 'What problem does DHCP solve?', 'DHCP automates address assignment so administrators do not configure every host manually.', 'easy'),
    ('ip-services-quiz', 2, 'What is PAT also commonly called?', 'PAT translates many internal sessions to a shared public address by using unique port values.', 'easy'),
    ('ip-services-quiz', 3, 'Why is NTP important on network devices?', 'Consistent time is critical for logs, authentication, correlation, and operational troubleshooting.', 'easy'),

    ('security-fundamentals-quiz', 1, 'Which protocol should replace Telnet for secure remote device management?', 'SSH encrypts management traffic and is the standard secure replacement for Telnet.', 'easy'),
    ('security-fundamentals-quiz', 2, 'Why are extended ACLs usually placed near the traffic source?', 'Placing extended ACLs closer to the source can stop unwanted traffic earlier and reduce unnecessary transit.', 'medium'),
    ('security-fundamentals-quiz', 3, 'What is a practical first step in hardening a new network device?', 'Removing or disabling unused services reduces attack surface before deeper configuration is applied.', 'easy'),

    ('automation-and-programmability-quiz', 1, 'What is one core advantage of API-driven network operations?', 'APIs enable consistent and repeatable data retrieval or configuration workflows at scale.', 'easy'),
    ('automation-and-programmability-quiz', 2, 'What does JSON primarily provide in network automation?', 'JSON offers a structured, machine-readable data format commonly used in API payloads and responses.', 'easy'),
    ('automation-and-programmability-quiz', 3, 'Why do teams prefer idempotent automation tasks?', 'Idempotent tasks can be run repeatedly without causing unintended state drift or duplicate changes.', 'medium')
) as x(quiz_slug, order_index, question_text, explanation, difficulty)
  on x.quiz_slug = q.slug
on conflict (quiz_id, order_index) do update
set
  question_text = excluded.question_text,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  question_type = excluded.question_type;

insert into public.question_options (
  question_id,
  option_text,
  is_correct,
  order_index
)
select
  qq.id,
  x.option_text,
  x.is_correct,
  x.order_index
from public.quiz_questions qq
join public.quizzes q on q.id = qq.quiz_id
join (
  values
    ('network-fundamentals-quiz', 1, 1, 'Network access layer', false),
    ('network-fundamentals-quiz', 1, 2, 'Transport layer', true),
    ('network-fundamentals-quiz', 1, 3, 'Internet layer', false),
    ('network-fundamentals-quiz', 1, 4, 'Physical layer', false),
    ('network-fundamentals-quiz', 2, 1, 'To eliminate all routing decisions', false),
    ('network-fundamentals-quiz', 2, 2, 'To reduce broadcast scope and organize addresses', true),
    ('network-fundamentals-quiz', 2, 3, 'To convert switches into routers', false),
    ('network-fundamentals-quiz', 2, 4, 'To prevent every ACL from being used', false),
    ('network-fundamentals-quiz', 3, 1, 'IPv6 removes the need for logical addressing', false),
    ('network-fundamentals-quiz', 3, 2, 'IPv6 uses a much larger address space', true),
    ('network-fundamentals-quiz', 3, 3, 'IPv6 cannot be routed dynamically', false),
    ('network-fundamentals-quiz', 3, 4, 'IPv6 only works inside a LAN', false),

    ('network-access-quiz', 1, 1, 'To increase cable speed', false),
    ('network-access-quiz', 1, 2, 'To create a separate broadcast domain', true),
    ('network-access-quiz', 1, 3, 'To convert frames into routes', false),
    ('network-access-quiz', 1, 4, 'To disable MAC learning', false),
    ('network-access-quiz', 2, 1, 'To carry multiple VLANs on one link', true),
    ('network-access-quiz', 2, 2, 'To force all frames to remain untagged', false),
    ('network-access-quiz', 2, 3, 'To make a switch behave like a hub', false),
    ('network-access-quiz', 2, 4, 'To remove the need for inter-VLAN routing', false),
    ('network-access-quiz', 3, 1, 'Mismatch can cause unexpected traffic handling', true),
    ('network-access-quiz', 3, 2, 'Mismatch improves redundancy automatically', false),
    ('network-access-quiz', 3, 3, 'Mismatch disables MAC addresses globally', false),
    ('network-access-quiz', 3, 4, 'Mismatch is required for VLAN 1 security', false),

    ('ip-connectivity-quiz', 1, 1, 'When every possible network has an explicit route', false),
    ('ip-connectivity-quiz', 1, 2, 'When unknown destinations should go to an upstream next hop', true),
    ('ip-connectivity-quiz', 1, 3, 'Only when using IPv6', false),
    ('ip-connectivity-quiz', 1, 4, 'Only on switches without management IPs', false),
    ('ip-connectivity-quiz', 2, 1, 'Routers must establish adjacency first', true),
    ('ip-connectivity-quiz', 2, 2, 'Routers must disable hello packets first', false),
    ('ip-connectivity-quiz', 2, 3, 'Routers must use PAT before LSAs are exchanged', false),
    ('ip-connectivity-quiz', 2, 4, 'Routers must share the same MAC table', false),
    ('ip-connectivity-quiz', 3, 1, 'It avoids any route calculations', false),
    ('ip-connectivity-quiz', 3, 2, 'It automatically adapts better to topology changes', true),
    ('ip-connectivity-quiz', 3, 3, 'It removes the need for IP addressing', false),
    ('ip-connectivity-quiz', 3, 4, 'It works only with single-area designs', false),

    ('ip-services-quiz', 1, 1, 'It encrypts management traffic', false),
    ('ip-services-quiz', 1, 2, 'It automates IP address assignment', true),
    ('ip-services-quiz', 1, 3, 'It replaces routing tables', false),
    ('ip-services-quiz', 1, 4, 'It creates VLAN trunks', false),
    ('ip-services-quiz', 2, 1, 'Private addressing tunneling', false),
    ('ip-services-quiz', 2, 2, 'Port address translation', true),
    ('ip-services-quiz', 2, 3, 'Priority access transport', false),
    ('ip-services-quiz', 2, 4, 'Packet analysis trace', false),
    ('ip-services-quiz', 3, 1, 'To standardize clock and log timing', true),
    ('ip-services-quiz', 3, 2, 'To assign VLAN numbers automatically', false),
    ('ip-services-quiz', 3, 3, 'To replace DNS', false),
    ('ip-services-quiz', 3, 4, 'To compress packet captures', false),

    ('security-fundamentals-quiz', 1, 1, 'HTTP', false),
    ('security-fundamentals-quiz', 1, 2, 'FTP', false),
    ('security-fundamentals-quiz', 1, 3, 'SSH', true),
    ('security-fundamentals-quiz', 1, 4, 'SNMPv1', false),
    ('security-fundamentals-quiz', 2, 1, 'They should only be used on WAN links', false),
    ('security-fundamentals-quiz', 2, 2, 'They stop unwanted traffic earlier in the path', true),
    ('security-fundamentals-quiz', 2, 3, 'They eliminate the need for routing', false),
    ('security-fundamentals-quiz', 2, 4, 'They must always be applied inbound and outbound together', false),
    ('security-fundamentals-quiz', 3, 1, 'Disable unused services', true),
    ('security-fundamentals-quiz', 3, 2, 'Turn on every available legacy protocol', false),
    ('security-fundamentals-quiz', 3, 3, 'Remove all ACLs', false),
    ('security-fundamentals-quiz', 3, 4, 'Convert the device to bridge mode', false),

    ('automation-and-programmability-quiz', 1, 1, 'APIs make workflows repeatable and consistent', true),
    ('automation-and-programmability-quiz', 1, 2, 'APIs remove the need for authentication', false),
    ('automation-and-programmability-quiz', 1, 3, 'APIs only work on wireless controllers', false),
    ('automation-and-programmability-quiz', 1, 4, 'APIs replace JSON with binary-only data', false),
    ('automation-and-programmability-quiz', 2, 1, 'It is a physical switch stacking protocol', false),
    ('automation-and-programmability-quiz', 2, 2, 'It is a structured data format used in API payloads', true),
    ('automation-and-programmability-quiz', 2, 3, 'It is a method for trunk encapsulation', false),
    ('automation-and-programmability-quiz', 2, 4, 'It is a replacement for IP routing', false),
    ('automation-and-programmability-quiz', 3, 1, 'They intentionally make duplicate changes each time', false),
    ('automation-and-programmability-quiz', 3, 2, 'They can run repeatedly without causing unintended drift', true),
    ('automation-and-programmability-quiz', 3, 3, 'They only work on Linux hosts', false),
    ('automation-and-programmability-quiz', 3, 4, 'They prevent any need for validation', false)
) as x(quiz_slug, question_order_index, order_index, option_text, is_correct)
  on x.quiz_slug = q.slug and x.question_order_index = qq.order_index
on conflict (question_id, order_index) do update
set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct;


-- ==============================
-- Phase 4: Exam simulator foundation
-- Source: supabase\migrations\20260308_phase4_exam_simulator_foundation.sql
-- ==============================
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.exam_configs (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  exam_mode text not null
    check (exam_mode in ('full_mock', 'quick_practice', 'random_mixed')),
  selection_strategy text not null default 'random'
    check (selection_strategy in ('random', 'balanced')),
  included_module_slugs text[] not null default '{}',
  time_limit_minutes integer not null check (time_limit_minutes > 0),
  question_count integer not null check (question_count > 0),
  passing_score integer not null default 70 check (passing_score >= 0 and passing_score <= 100),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (certification_id, title)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_config_id uuid not null references public.exam_configs(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'timed_out')),
  started_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  submitted_at timestamptz null,
  duration_seconds integer not null check (duration_seconds > 0),
  time_used_seconds integer null check (time_used_seconds >= 0),
  total_questions integer not null check (total_questions > 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  incorrect_answers integer not null default 0 check (incorrect_answers >= 0),
  unanswered_answers integer not null default 0 check (unanswered_answers >= 0),
  flagged_count integer not null default 0 check (flagged_count >= 0),
  score integer null check (score >= 0 and score <= 100),
  current_question_index integer not null default 1 check (current_question_index > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exam_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  selected_option_id uuid null references public.question_options(id) on delete set null,
  question_order integer not null check (question_order > 0),
  module_slug_snapshot text null,
  module_title_snapshot text null,
  question_text_snapshot text not null,
  explanation_snapshot text not null default '',
  difficulty_snapshot text not null default 'medium'
    check (difficulty_snapshot in ('easy', 'medium', 'hard')),
  question_type_snapshot text not null default 'single_choice'
    check (question_type_snapshot in ('single_choice')),
  options_snapshot jsonb not null default '[]'::jsonb,
  correct_option_id uuid null,
  flagged boolean not null default false,
  is_correct boolean null,
  answered_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (exam_attempt_id, question_id),
  unique (exam_attempt_id, question_order)
);

create index if not exists idx_exam_configs_certification_id
  on public.exam_configs(certification_id);
create index if not exists idx_exam_configs_is_published
  on public.exam_configs(is_published);
create index if not exists idx_exam_attempts_user_id
  on public.exam_attempts(user_id);
create index if not exists idx_exam_attempts_exam_config_id
  on public.exam_attempts(exam_config_id);
create index if not exists idx_exam_attempts_status
  on public.exam_attempts(status);
create index if not exists idx_exam_attempt_answers_attempt_id
  on public.exam_attempt_answers(exam_attempt_id);
create index if not exists idx_exam_attempt_answers_question_id
  on public.exam_attempt_answers(question_id);
create index if not exists idx_exam_attempt_answers_flagged
  on public.exam_attempt_answers(flagged);

drop trigger if exists trg_exam_configs_updated_at on public.exam_configs;
create trigger trg_exam_configs_updated_at
before update on public.exam_configs
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_exam_attempts_updated_at on public.exam_attempts;
create trigger trg_exam_attempts_updated_at
before update on public.exam_attempts
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_exam_attempt_answers_updated_at on public.exam_attempt_answers;
create trigger trg_exam_attempt_answers_updated_at
before update on public.exam_attempt_answers
for each row
execute function public.set_updated_at_timestamp();

alter table public.exam_configs enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_answers enable row level security;

drop policy if exists "exam_configs_select_published_authenticated" on public.exam_configs;
create policy "exam_configs_select_published_authenticated"
on public.exam_configs
for select
to authenticated
using (is_published = true);

drop policy if exists "exam_attempts_select_own" on public.exam_attempts;
create policy "exam_attempts_select_own"
on public.exam_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own"
on public.exam_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "exam_attempts_update_own" on public.exam_attempts;
create policy "exam_attempts_update_own"
on public.exam_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "exam_attempt_answers_select_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_select_own"
on public.exam_attempt_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);

drop policy if exists "exam_attempt_answers_insert_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_insert_own"
on public.exam_attempt_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);

drop policy if exists "exam_attempt_answers_update_own" on public.exam_attempt_answers;
create policy "exam_attempt_answers_update_own"
on public.exam_attempt_answers
for update
to authenticated
using (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.exam_attempts ea
    where ea.id = exam_attempt_id
      and ea.user_id = auth.uid()
  )
);

-- ==============================
-- Phase 4: CCNA exam config seed data
-- Source: supabase\seeds\20260308_ccna_exam_configs.sql
-- ==============================
insert into public.exam_configs (
  certification_id,
  title,
  slug,
  description,
  exam_mode,
  selection_strategy,
  included_module_slugs,
  time_limit_minutes,
  question_count,
  passing_score,
  is_published
)
select
  c.id,
  x.title,
  x.slug,
  x.description,
  x.exam_mode,
  x.selection_strategy,
  x.included_module_slugs,
  x.time_limit_minutes,
  x.question_count,
  x.passing_score,
  true
from public.certifications c
join (
  values
    (
      'CCNA Full Mock Exam',
      'ccna-full-mock-exam',
      'A longer CCNA-style mock exam that pulls questions across all current domains with a full-length timer.',
      'full_mock',
      'balanced',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      120,
      18,
      80
    ),
    (
      'CCNA Quick Practice Exam',
      'ccna-quick-practice-exam',
      'A shorter timed practice run for fast review sessions before a study block or checkpoint.',
      'quick_practice',
      'random',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      25,
      8,
      75
    ),
    (
      'CCNA Random Mixed Exam',
      'ccna-random-mixed-exam',
      'A mixed-domain exam session with randomized coverage and a moderate timer window.',
      'random_mixed',
      'balanced',
      array[
        'network-fundamentals',
        'network-access',
        'ip-connectivity',
        'ip-services',
        'security-fundamentals',
        'automation-and-programmability'
      ]::text[],
      45,
      12,
      78
    )
) as x(
  title,
  slug,
  description,
  exam_mode,
  selection_strategy,
  included_module_slugs,
  time_limit_minutes,
  question_count,
  passing_score
)
  on c.slug = 'ccna'
on conflict (slug) do update
set
  certification_id = excluded.certification_id,
  title = excluded.title,
  description = excluded.description,
  exam_mode = excluded.exam_mode,
  selection_strategy = excluded.selection_strategy,
  included_module_slugs = excluded.included_module_slugs,
  time_limit_minutes = excluded.time_limit_minutes,
  question_count = excluded.question_count,
  passing_score = excluded.passing_score,
  is_published = excluded.is_published,
  updated_at = timezone('utc', now());

-- ==============================
-- Phase 5: Labs foundation
-- Source: supabase\migrations\20260308_phase5_labs_foundation.sql
-- ==============================
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  objectives text not null default '',
  instructions text not null default '',
  topology_notes text null,
  expected_outcomes text not null default '',
  difficulty text not null default 'intermediate'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, title)
);

create table if not exists public.lab_files (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null default 'packet_tracer'
    check (file_type in ('packet_tracer', 'guide', 'topology', 'solution', 'reference')),
  sort_order integer not null default 1 check (sort_order > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (lab_id, sort_order)
);

create table if not exists public.lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lab_id)
);

create index if not exists idx_labs_module_id on public.labs(module_id);
create index if not exists idx_labs_lesson_id on public.labs(lesson_id);
create index if not exists idx_labs_is_published on public.labs(is_published);
create index if not exists idx_lab_files_lab_id on public.lab_files(lab_id);
create index if not exists idx_lab_progress_user_id on public.lab_progress(user_id);
create index if not exists idx_lab_progress_lab_id on public.lab_progress(lab_id);
create index if not exists idx_lab_progress_status on public.lab_progress(status);

drop trigger if exists trg_labs_updated_at on public.labs;
create trigger trg_labs_updated_at
before update on public.labs
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_lab_progress_updated_at on public.lab_progress;
create trigger trg_lab_progress_updated_at
before update on public.lab_progress
for each row
execute function public.set_updated_at_timestamp();

alter table public.labs enable row level security;
alter table public.lab_files enable row level security;
alter table public.lab_progress enable row level security;

drop policy if exists "labs_select_published_authenticated" on public.labs;
create policy "labs_select_published_authenticated"
on public.labs
for select
to authenticated
using (is_published = true);

revoke select on public.lab_files from authenticated;

drop policy if exists "lab_progress_select_own" on public.lab_progress;
create policy "lab_progress_select_own"
on public.lab_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "lab_progress_insert_own" on public.lab_progress;
create policy "lab_progress_insert_own"
on public.lab_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "lab_progress_update_own" on public.lab_progress;
create policy "lab_progress_update_own"
on public.lab_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-files',
  'lab-files',
  false,
  52428800,
  array[
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'text/plain'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lab_storage_select_authenticated" on storage.objects;

-- ==============================
-- Phase 5: CCNA lab seed data
-- Source: supabase\seeds\20260308_ccna_labs_seed.sql
-- ==============================
insert into public.labs (
  module_id,
  lesson_id,
  title,
  slug,
  summary,
  objectives,
  instructions,
  topology_notes,
  expected_outcomes,
  difficulty,
  estimated_minutes,
  is_published
)
select
  m.id,
  l.id,
  x.title,
  x.slug,
  x.summary,
  x.objectives,
  x.instructions,
  x.topology_notes,
  x.expected_outcomes,
  x.difficulty,
  x.estimated_minutes,
  true
from public.modules m
join public.courses c
  on c.id = m.course_id
join (
  values
    (
      'network-fundamentals',
      'understand-the-network-layers',
      'Build a Small Office Topology',
      'build-a-small-office-topology',
      'Create a foundational Packet Tracer topology with end devices, a switch, and a router.',
      'Map devices to network roles, apply an addressing plan, and verify basic end-to-end reachability.',
      '1. Place the required PCs, switch, and router in Packet Tracer.\n2. Cable the topology using the correct media.\n3. Apply the documented IPv4 addressing plan.\n4. Configure host default gateways.\n5. Verify connectivity with pings and note any failures.\n6. Document which OSI/TCP-IP layers were involved during troubleshooting.',
      'Topology should represent one routed LAN with two end hosts and an upstream edge router interface.',
      'The learner can explain the device roles, verify addressing accuracy, and demonstrate successful host-to-router connectivity.',
      'beginner',
      35
    ),
    (
      'network-access',
      'segment-lans-with-vlans',
      'Configure VLAN Segmentation and Trunks',
      'configure-vlan-segmentation-and-trunks',
      'Segment a campus access switch into multiple VLANs and validate trunk behavior between switches.',
      'Create VLANs, assign access ports, configure a trunk link, and validate traffic separation.',
      '1. Create user and management VLANs on both switches.\n2. Assign access ports to the correct VLANs.\n3. Configure the inter-switch link as an 802.1Q trunk.\n4. Validate trunk allowed VLAN behavior.\n5. Test same-VLAN and different-VLAN connectivity and record the outcome.',
      'Use two access switches with one trunk interconnect and hosts placed across at least two VLANs.',
      'The learner can distinguish access and trunk roles, confirm VLAN propagation, and justify why inter-VLAN traffic still requires routing.',
      'intermediate',
      45
    ),
    (
      'ip-connectivity',
      'route-between-networks',
      'Implement Static Routing Across Branch Routers',
      'implement-static-routing-across-branch-routers',
      'Connect multiple routed networks and validate static routing behavior between branch segments.',
      'Configure router interfaces, build static routes, and confirm traffic flow across remote networks.',
      '1. Configure addressing on two routers and their connected LAN interfaces.\n2. Add static routes for remote networks.\n3. Validate routing tables.\n4. Test remote reachability from end hosts.\n5. Simulate one routing mistake, observe the failure, then correct it.',
      'Use two routers and at least one LAN behind each router to make route validation meaningful.',
      'The learner can read static routes, identify missing next hops, and restore connectivity between remote LANs.',
      'intermediate',
      50
    ),
    (
      'ip-services',
      'deliver-addresses-with-dhcp',
      'Configure DHCP and PAT Services',
      'configure-dhcp-and-pat-services',
      'Deploy DHCP for client addressing and PAT for controlled upstream access.',
      'Deliver dynamic addressing to clients, validate leases, and translate internal traffic through PAT.',
      '1. Configure a DHCP pool with excluded addresses.\n2. Validate that hosts receive correct leases.\n3. Configure PAT on the edge router.\n4. Mark inside and outside interfaces correctly.\n5. Generate test traffic and verify translation entries.\n6. Record the operational difference between DHCP and PAT.',
      'Topology should include a user LAN, an edge router, and a simulated upstream segment for NAT/PAT testing.',
      'The learner can validate DHCP lease allocation, inspect NAT translations, and explain how address conservation is achieved.',
      'intermediate',
      45
    ),
    (
      'security-fundamentals',
      'secure-device-management',
      'Harden Device Access with SSH and ACLs',
      'harden-device-access-with-ssh-and-acls',
      'Secure management access to a router or switch and restrict unwanted traffic with an ACL.',
      'Enable secure remote management, disable insecure access paths, and apply a filtering policy.',
      '1. Configure a local admin account and enable SSH.\n2. Disable Telnet and unused services.\n3. Generate RSA keys and verify secure login.\n4. Create an ACL that permits required traffic and blocks a test case.\n5. Apply the ACL in the correct direction.\n6. Confirm intended management access still works.',
      'Use one managed network device plus at least two hosts so ACL behavior can be observed from different sources.',
      'The learner can justify secure management settings, read ACL logic, and prove that the policy blocks the expected traffic only.',
      'intermediate',
      40
    ),
    (
      'automation-and-programmability',
      'describe-controller-based-networking',
      'Validate Controller Data and Device Inventory',
      'validate-controller-data-and-device-inventory',
      'Practice the operational workflow of reading controller-style data and comparing it with device state.',
      'Review structured output, verify inventory consistency, and document how automation improves repeated checks.',
      '1. Open the supplied lab guide and Packet Tracer workspace.\n2. Review the topology and identify which data points should be gathered repeatedly.\n3. Compare device names, addressing, and interface roles against the provided controller-style inventory notes.\n4. Correct one intentionally mismatched inventory item.\n5. Summarize where APIs or structured data would reduce manual effort.',
      'This lab emphasizes workflow and validation notes rather than advanced scripting, matching the current CCNA scope.',
      'The learner can describe how structured inventory checks support automation readiness and spot configuration drift in a repeatable process.',
      'beginner',
      30
    )
) as x(
  module_slug,
  lesson_slug,
  title,
  slug,
  summary,
  objectives,
  instructions,
  topology_notes,
  expected_outcomes,
  difficulty,
  estimated_minutes
)
  on x.module_slug = m.slug
left join public.lessons l
  on l.module_id = m.id and l.slug = x.lesson_slug
where c.slug = 'ccna-200-301-preparation'
on conflict (slug) do update
set
  module_id = excluded.module_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  summary = excluded.summary,
  objectives = excluded.objectives,
  instructions = excluded.instructions,
  topology_notes = excluded.topology_notes,
  expected_outcomes = excluded.expected_outcomes,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published,
  updated_at = timezone('utc', now());

insert into public.lab_files (
  lab_id,
  file_name,
  file_path,
  file_type,
  sort_order
)
select
  labs.id,
  x.file_name,
  x.file_path,
  x.file_type,
  x.sort_order
from public.labs
join (
  values
    ('build-a-small-office-topology', 'small-office-topology.pkt', 'ccna/network-fundamentals/build-a-small-office-topology/small-office-topology.pkt', 'packet_tracer', 1),
    ('build-a-small-office-topology', 'small-office-lab-guide.pdf', 'ccna/network-fundamentals/build-a-small-office-topology/small-office-lab-guide.pdf', 'guide', 2),
    ('configure-vlan-segmentation-and-trunks', 'vlan-trunking-lab.pkt', 'ccna/network-access/configure-vlan-segmentation-and-trunks/vlan-trunking-lab.pkt', 'packet_tracer', 1),
    ('configure-vlan-segmentation-and-trunks', 'vlan-trunking-instructions.pdf', 'ccna/network-access/configure-vlan-segmentation-and-trunks/vlan-trunking-instructions.pdf', 'guide', 2),
    ('implement-static-routing-across-branch-routers', 'static-routing-branches.pkt', 'ccna/ip-connectivity/implement-static-routing-across-branch-routers/static-routing-branches.pkt', 'packet_tracer', 1),
    ('implement-static-routing-across-branch-routers', 'static-routing-checklist.txt', 'ccna/ip-connectivity/implement-static-routing-across-branch-routers/static-routing-checklist.txt', 'reference', 2),
    ('configure-dhcp-and-pat-services', 'dhcp-pat-services.pkt', 'ccna/ip-services/configure-dhcp-and-pat-services/dhcp-pat-services.pkt', 'packet_tracer', 1),
    ('configure-dhcp-and-pat-services', 'dhcp-pat-guide.pdf', 'ccna/ip-services/configure-dhcp-and-pat-services/dhcp-pat-guide.pdf', 'guide', 2),
    ('harden-device-access-with-ssh-and-acls', 'ssh-acl-hardening.pkt', 'ccna/security-fundamentals/harden-device-access-with-ssh-and-acls/ssh-acl-hardening.pkt', 'packet_tracer', 1),
    ('harden-device-access-with-ssh-and-acls', 'ssh-acl-validation.txt', 'ccna/security-fundamentals/harden-device-access-with-ssh-and-acls/ssh-acl-validation.txt', 'reference', 2),
    ('validate-controller-data-and-device-inventory', 'controller-inventory-workspace.pkt', 'ccna/automation-and-programmability/validate-controller-data-and-device-inventory/controller-inventory-workspace.pkt', 'packet_tracer', 1),
    ('validate-controller-data-and-device-inventory', 'controller-inventory-guide.pdf', 'ccna/automation-and-programmability/validate-controller-data-and-device-inventory/controller-inventory-guide.pdf', 'guide', 2)
) as x(lab_slug, file_name, file_path, file_type, sort_order)
  on x.lab_slug = labs.slug
on conflict (lab_id, sort_order) do update
set
  file_name = excluded.file_name,
  file_path = excluded.file_path,
  file_type = excluded.file_type;

-- ==============================
-- Phase 6: CLI practice foundation
-- Source: supabase\migrations\20260308_phase6_cli_practice_foundation.sql
-- ==============================
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.cli_challenges (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  lesson_id uuid null references public.lessons(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  scenario text not null default '',
  objectives text not null default '',
  difficulty text not null default 'intermediate'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, title)
);

create table if not exists public.cli_steps (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.cli_challenges(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  prompt text not null,
  expected_command_patterns jsonb not null default '[]'::jsonb,
  validation_type text not null default 'normalized'
    check (validation_type in ('exact', 'normalized', 'pattern')),
  hints text null,
  explanation text null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (challenge_id, step_number)
);

create table if not exists public.cli_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.cli_challenges(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('not_started', 'in_progress', 'completed')),
  current_step integer not null default 1 check (current_step > 0),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cli_attempt_step_results (
  id uuid primary key default gen_random_uuid(),
  cli_attempt_id uuid not null references public.cli_attempts(id) on delete cascade,
  cli_step_id uuid not null references public.cli_steps(id) on delete cascade,
  entered_command text not null,
  is_correct boolean not null default false,
  feedback text not null default '',
  answered_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cli_challenges_module_id on public.cli_challenges(module_id);
create index if not exists idx_cli_challenges_lesson_id on public.cli_challenges(lesson_id);
create index if not exists idx_cli_challenges_is_published on public.cli_challenges(is_published);
create index if not exists idx_cli_steps_challenge_id on public.cli_steps(challenge_id);
create index if not exists idx_cli_attempts_user_id on public.cli_attempts(user_id);
create index if not exists idx_cli_attempts_challenge_id on public.cli_attempts(challenge_id);
create index if not exists idx_cli_attempts_status on public.cli_attempts(status);
create index if not exists idx_cli_attempt_step_results_attempt_id on public.cli_attempt_step_results(cli_attempt_id);
create index if not exists idx_cli_attempt_step_results_step_id on public.cli_attempt_step_results(cli_step_id);

drop trigger if exists trg_cli_challenges_updated_at on public.cli_challenges;
create trigger trg_cli_challenges_updated_at
before update on public.cli_challenges
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_cli_attempts_updated_at on public.cli_attempts;
create trigger trg_cli_attempts_updated_at
before update on public.cli_attempts
for each row
execute function public.set_updated_at_timestamp();

alter table public.cli_challenges enable row level security;
alter table public.cli_steps enable row level security;
alter table public.cli_attempts enable row level security;
alter table public.cli_attempt_step_results enable row level security;

drop policy if exists "cli_challenges_select_published_authenticated" on public.cli_challenges;
create policy "cli_challenges_select_published_authenticated"
on public.cli_challenges
for select
to authenticated
using (is_published = true);

revoke select on public.cli_steps from authenticated;

drop policy if exists "cli_attempts_select_own" on public.cli_attempts;
create policy "cli_attempts_select_own"
on public.cli_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cli_attempts_insert_own" on public.cli_attempts;
create policy "cli_attempts_insert_own"
on public.cli_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "cli_attempts_update_own" on public.cli_attempts;
create policy "cli_attempts_update_own"
on public.cli_attempts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "cli_attempt_step_results_select_own" on public.cli_attempt_step_results;
create policy "cli_attempt_step_results_select_own"
on public.cli_attempt_step_results
for select
to authenticated
using (
  exists (
    select 1
    from public.cli_attempts
    where cli_attempts.id = cli_attempt_id
      and cli_attempts.user_id = auth.uid()
  )
);

drop policy if exists "cli_attempt_step_results_insert_own" on public.cli_attempt_step_results;
create policy "cli_attempt_step_results_insert_own"
on public.cli_attempt_step_results
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cli_attempts
    where cli_attempts.id = cli_attempt_id
      and cli_attempts.user_id = auth.uid()
  )
);

-- ==============================
-- Phase 6: CCNA CLI challenge seed data
-- Source: supabase\seeds\20260308_ccna_cli_challenges_seed.sql
-- ==============================
insert into public.cli_challenges (
  module_id,
  lesson_id,
  title,
  slug,
  summary,
  scenario,
  objectives,
  difficulty,
  estimated_minutes,
  is_published
)
select
  m.id,
  l.id,
  x.title,
  x.slug,
  x.summary,
  x.scenario,
  x.objectives,
  x.difficulty,
  x.estimated_minutes,
  true
from public.modules m
join public.courses c
  on c.id = m.course_id
join (
  values
    (
      'network-fundamentals',
      'understand-the-network-layers',
      'Baseline Interface Verification',
      'baseline-interface-verification',
      'Practice the basic operational commands used to confirm interface state and reachability.',
      'You have just connected a branch router in Packet Tracer and need to confirm that the local interface and upstream reachability are working before deeper troubleshooting begins.',
      'Verify interface state, confirm IP assignment, and validate a basic reachability check from the CLI.',
      'beginner',
      12
    ),
    (
      'network-access',
      'segment-lans-with-vlans',
      'Create a VLAN and Prepare a Trunk',
      'create-a-vlan-and-prepare-a-trunk',
      'Practice the CLI sequence for creating a VLAN, naming it, and preparing an uplink for trunking.',
      'A distribution uplink is being prepared for a new user segment. You need to build VLAN 20, name it correctly, and confirm the inter-switch link will carry VLAN traffic.',
      'Use switch configuration mode commands to create a VLAN, apply the name, and set a switchport to trunk mode.',
      'intermediate',
      15
    ),
    (
      'ip-connectivity',
      'route-between-networks',
      'Add a Static Route for a Remote LAN',
      'add-a-static-route-for-a-remote-lan',
      'Practice entering a remote network route and verifying that the router learned it correctly.',
      'A remote branch LAN has come online behind the next-hop router at 10.0.12.2. You need to add reachability from the local router and confirm the route is present.',
      'Configure a static route and verify it in the routing table.',
      'intermediate',
      14
    ),
    (
      'ip-services',
      'deliver-addresses-with-dhcp',
      'Build a DHCP Pool for User Devices',
      'build-a-dhcp-pool-for-user-devices',
      'Practice the sequence for entering DHCP pool configuration and setting the default gateway.',
      'A user VLAN is ready for dynamic addressing. You need to create the pool and provide the correct default gateway so hosts can route off the subnet.',
      'Enter DHCP pool configuration mode and add the required default-router statement.',
      'intermediate',
      14
    ),
    (
      'security-fundamentals',
      'secure-device-management',
      'Harden Remote Access with SSH',
      'harden-remote-access-with-ssh',
      'Practice core CLI steps used to replace insecure management access with SSH.',
      'A router still allows insecure remote management. You need to prepare the device for SSH-only access and lock down the VTY lines.',
      'Configure a local username, generate RSA keys, and restrict VTY transport to SSH.',
      'intermediate',
      16
    ),
    (
      'automation-and-programmability',
      'describe-controller-based-networking',
      'Collect Device Facts for Automation Readiness',
      'collect-device-facts-for-automation-readiness',
      'Practice the verification commands commonly gathered before handing a device over to an automated workflow.',
      'Your team is preparing a repeatable automation workflow and needs a baseline set of CLI facts to compare with controller inventory data.',
      'Use show commands to gather software, interface, and hostname data consistently.',
      'beginner',
      10
    )
) as x(
  module_slug,
  lesson_slug,
  title,
  slug,
  summary,
  scenario,
  objectives,
  difficulty,
  estimated_minutes
)
  on x.module_slug = m.slug
left join public.lessons l
  on l.module_id = m.id and l.slug = x.lesson_slug
where c.slug = 'ccna-200-301-preparation'
on conflict (slug) do update
set
  module_id = excluded.module_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  summary = excluded.summary,
  scenario = excluded.scenario,
  objectives = excluded.objectives,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published,
  updated_at = timezone('utc', now());

insert into public.cli_steps (
  challenge_id,
  step_number,
  prompt,
  expected_command_patterns,
  validation_type,
  hints,
  explanation
)
select
  c.id,
  x.step_number,
  x.prompt,
  x.expected_command_patterns,
  x.validation_type,
  x.hints,
  x.explanation
from public.cli_challenges c
join (
  values
    (
      'baseline-interface-verification',
      1,
      'Enter the command that lists interface names, IP addresses, and line protocol state in a concise table.',
      jsonb_build_array('show ip interface brief'),
      'normalized',
      'This is one of the first verification commands used after assigning addresses.',
      'show ip interface brief gives a fast summary of interface addressing and operational state.'
    ),
    (
      'baseline-interface-verification',
      2,
      'Enter the command to test reachability to the upstream gateway at 10.10.10.1.',
      jsonb_build_array('ping 10.10.10.1'),
      'normalized',
      'Use the standard IOS reachability command followed by the destination IP.',
      'ping confirms whether the device can reach the specified destination from the current routing context.'
    ),
    (
      'baseline-interface-verification',
      3,
      'Enter the command that shows the router ARP cache.',
      jsonb_build_array('show arp'),
      'normalized',
      'You want the command that lists IP-to-MAC address mappings.',
      'show arp is commonly used to confirm Layer 2 resolution of local IPv4 neighbors.'
    ),

    (
      'create-a-vlan-and-prepare-a-trunk',
      1,
      'Create VLAN 20.',
      jsonb_build_array('vlan 20'),
      'normalized',
      'Start by entering the VLAN configuration command with the correct VLAN ID.',
      'vlan 20 creates or enters the configuration context for VLAN 20.'
    ),
    (
      'create-a-vlan-and-prepare-a-trunk',
      2,
      'Name VLAN 20 as STAFF.',
      jsonb_build_array('name STAFF', 'name staff'),
      'normalized',
      'Use the VLAN naming command inside VLAN configuration mode.',
      'name STAFF labels the VLAN clearly for operational use and documentation.'
    ),
    (
      'create-a-vlan-and-prepare-a-trunk',
      3,
      'On the uplink interface, enter the command that forces the switchport into trunk mode.',
      jsonb_build_array('switchport mode trunk'),
      'normalized',
      'Use the switchport subcommand that defines the operational link type.',
      'switchport mode trunk is required when a link must carry traffic for multiple VLANs.'
    ),

    (
      'add-a-static-route-for-a-remote-lan',
      1,
      'Add a route to remote network 192.168.50.0/24 using next hop 10.0.12.2.',
      jsonb_build_array('ip route 192.168.50.0 255.255.255.0 10.0.12.2'),
      'normalized',
      'Use the IOS static route syntax: destination network, mask, then next hop.',
      'ip route adds a manual route to a remote network through a specified next-hop address.'
    ),
    (
      'add-a-static-route-for-a-remote-lan',
      2,
      'Display the full routing table.',
      jsonb_build_array('show ip route'),
      'normalized',
      'Use the standard verification command for IPv4 routes.',
      'show ip route confirms whether the static route was accepted into the routing table.'
    ),
    (
      'add-a-static-route-for-a-remote-lan',
      3,
      'Display only routes that mention network 192.168.50.0 by using the include filter.',
      jsonb_build_array('^show ip route \\| include 192\\.168\\.50\\.0$'),
      'pattern',
      'Use a pipe with include to narrow the output to the remote network you just configured.',
      'Filtering route output helps operators confirm a specific route quickly without reviewing the entire table.'
    ),

    (
      'build-a-dhcp-pool-for-user-devices',
      1,
      'Create a DHCP pool named BRANCH-USERS.',
      jsonb_build_array('ip dhcp pool BRANCH-USERS', 'ip dhcp pool branch-users'),
      'normalized',
      'Use the global configuration command that opens a DHCP pool context.',
      'ip dhcp pool creates a named scope where DHCP network parameters can be defined.'
    ),
    (
      'build-a-dhcp-pool-for-user-devices',
      2,
      'Inside the pool, set the network as 192.168.30.0/24.',
      jsonb_build_array('network 192.168.30.0 255.255.255.0'),
      'normalized',
      'Use the DHCP pool network statement with network and mask.',
      'The network statement defines which subnet the DHCP pool will serve.'
    ),
    (
      'build-a-dhcp-pool-for-user-devices',
      3,
      'Inside the pool, set the default gateway to 192.168.30.1.',
      jsonb_build_array('default-router 192.168.30.1'),
      'normalized',
      'Use the DHCP option command that tells clients where to send off-subnet traffic.',
      'default-router gives DHCP clients the gateway they need for routed connectivity.'
    ),

    (
      'harden-remote-access-with-ssh',
      1,
      'Create a local user named admin with secret Pa55w0rd!',
      jsonb_build_array('username admin secret Pa55w0rd!'),
      'exact',
      'Use the full username command with the secret keyword and the provided password.',
      'A local admin user is a common prerequisite for secure remote management.'
    ),
    (
      'harden-remote-access-with-ssh',
      2,
      'Generate RSA keys with modulus 2048.',
      jsonb_build_array('crypto key generate rsa modulus 2048'),
      'normalized',
      'SSH depends on local RSA keys. Include the modulus value in the command.',
      'RSA key generation is required before the device can accept SSH connections.'
    ),
    (
      'harden-remote-access-with-ssh',
      3,
      'Under the VTY lines, enter the command that allows only SSH as the transport protocol.',
      jsonb_build_array('transport input ssh'),
      'normalized',
      'Use the transport command that excludes Telnet.',
      'transport input ssh prevents insecure Telnet sessions on the VTY lines.'
    ),

    (
      'collect-device-facts-for-automation-readiness',
      1,
      'Enter the command that displays software and hardware version details.',
      jsonb_build_array('show version'),
      'normalized',
      'Use the standard IOS command that exposes software version and uptime details.',
      'show version is a common first fact-gathering command for automation baselines.'
    ),
    (
      'collect-device-facts-for-automation-readiness',
      2,
      'Enter the command that provides a compact interface and IP summary.',
      jsonb_build_array('show ip interface brief'),
      'normalized',
      'Use the concise interface verification command.',
      'show ip interface brief is efficient for quickly comparing interface state with inventory data.'
    ),
    (
      'collect-device-facts-for-automation-readiness',
      3,
      'Enter a command that filters the running configuration to show only the hostname line.',
      jsonb_build_array(
        '^show running-config \\| include hostname$',
        '^show run \\| include hostname$'
      ),
      'pattern',
      'Use a pipe include filter and target the hostname keyword.',
      'Filtering the running configuration is useful when collecting a small fact set for documentation or automation comparison.'
    )
) as x(
  challenge_slug,
  step_number,
  prompt,
  expected_command_patterns,
  validation_type,
  hints,
  explanation
)
  on x.challenge_slug = c.slug
on conflict (challenge_id, step_number) do update
set
  prompt = excluded.prompt,
  expected_command_patterns = excluded.expected_command_patterns,
  validation_type = excluded.validation_type,
  hints = excluded.hints,
  explanation = excluded.explanation;

-- ==============================
-- Phase 7: Tutor support foundation
-- Source: supabase\migrations\20260308_phase7_tutor_support_foundation.sql
-- ==============================
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.tutor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  bio text not null default '',
  expertise text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  tutor_profile_id uuid null references public.tutor_profiles(id) on delete set null,
  subject text not null,
  category text not null default 'general'
    check (
      category in (
        'general',
        'lesson_clarification',
        'quiz_help',
        'exam_help',
        'lab_help',
        'cli_help'
      )
    ),
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_attempt_id uuid null references public.quiz_attempts(id) on delete set null,
  exam_attempt_id uuid null references public.exam_attempts(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message_body text not null check (length(trim(message_body)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_tutor_profiles_user_id on public.tutor_profiles(user_id);
create index if not exists idx_tutor_profiles_is_active on public.tutor_profiles(is_active);
create index if not exists idx_support_requests_learner_user_id on public.support_requests(learner_user_id);
create index if not exists idx_support_requests_tutor_profile_id on public.support_requests(tutor_profile_id);
create index if not exists idx_support_requests_status on public.support_requests(status);
create index if not exists idx_support_requests_priority on public.support_requests(priority);
create index if not exists idx_support_requests_updated_at on public.support_requests(updated_at desc);
create index if not exists idx_support_requests_lesson_id on public.support_requests(lesson_id);
create index if not exists idx_support_requests_quiz_attempt_id on public.support_requests(quiz_attempt_id);
create index if not exists idx_support_requests_exam_attempt_id on public.support_requests(exam_attempt_id);
create index if not exists idx_support_requests_lab_id on public.support_requests(lab_id);
create index if not exists idx_support_requests_cli_challenge_id on public.support_requests(cli_challenge_id);
create index if not exists idx_support_messages_request_id on public.support_messages(support_request_id);
create index if not exists idx_support_messages_sender_user_id on public.support_messages(sender_user_id);
create index if not exists idx_support_messages_created_at on public.support_messages(created_at);

drop trigger if exists trg_support_requests_updated_at on public.support_requests;
create trigger trg_support_requests_updated_at
before update on public.support_requests
for each row
execute function public.set_updated_at_timestamp();

alter table public.tutor_profiles enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "tutor_profiles_select_active_authenticated" on public.tutor_profiles;
create policy "tutor_profiles_select_active_authenticated"
on public.tutor_profiles
for select
to authenticated
using (is_active = true);

drop policy if exists "tutor_profiles_update_own" on public.tutor_profiles;
create policy "tutor_profiles_update_own"
on public.tutor_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "support_requests_select_accessible" on public.support_requests;
create policy "support_requests_select_accessible"
on public.support_requests
for select
to authenticated
using (
  auth.uid() = learner_user_id
  or exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        tp.id = support_requests.tutor_profile_id
        or (
          support_requests.tutor_profile_id is null
          and support_requests.status in ('open', 'in_progress')
        )
      )
  )
);

drop policy if exists "support_requests_insert_own" on public.support_requests;
create policy "support_requests_insert_own"
on public.support_requests
for insert
to authenticated
with check (auth.uid() = learner_user_id);

drop policy if exists "support_requests_update_tutor_accessible" on public.support_requests;
create policy "support_requests_update_tutor_accessible"
on public.support_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        tp.id = support_requests.tutor_profile_id
        or (
          support_requests.tutor_profile_id is null
          and support_requests.status in ('open', 'in_progress')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.tutor_profiles tp
    where tp.user_id = auth.uid()
      and tp.is_active = true
      and (
        support_requests.tutor_profile_id is null
        or support_requests.tutor_profile_id = tp.id
      )
  )
);

drop policy if exists "support_messages_select_accessible" on public.support_messages;
create policy "support_messages_select_accessible"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_requests sr
    where sr.id = support_messages.support_request_id
      and (
        sr.learner_user_id = auth.uid()
        or exists (
          select 1
          from public.tutor_profiles tp
          where tp.user_id = auth.uid()
            and tp.is_active = true
            and (
              tp.id = sr.tutor_profile_id
              or (
                sr.tutor_profile_id is null
                and sr.status in ('open', 'in_progress')
              )
            )
        )
      )
  )
);

drop policy if exists "support_messages_insert_accessible" on public.support_messages;
create policy "support_messages_insert_accessible"
on public.support_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.support_requests sr
    where sr.id = support_messages.support_request_id
      and (
        sr.learner_user_id = auth.uid()
        or exists (
          select 1
          from public.tutor_profiles tp
          where tp.user_id = auth.uid()
            and tp.is_active = true
            and (
              tp.id = sr.tutor_profile_id
              or (
                sr.tutor_profile_id is null
                and sr.status in ('open', 'in_progress')
              )
            )
        )
      )
  )
);

grant select, update on public.tutor_profiles to authenticated;
grant select, insert, update on public.support_requests to authenticated;
grant select, insert on public.support_messages to authenticated;

-- ==============================
-- Phase 7: Tutor profile seed data
-- Source: supabase\seeds\20260308_tutor_profiles_seed.sql
-- ==============================
with ranked_users as (
  select
    id,
    email,
    row_number() over (order by created_at asc) as row_num
  from auth.users
)
insert into public.tutor_profiles (
  user_id,
  display_name,
  bio,
  expertise,
  is_active
)
select
  ranked_users.id,
  case ranked_users.row_num
    when 1 then 'Amina Okafor'
    when 2 then 'Marcus Lee'
    else concat('Tutor ', ranked_users.row_num)
  end,
  case ranked_users.row_num
    when 1 then 'CCNA mentor focused on routing fundamentals, subnetting, and hands-on troubleshooting.'
    when 2 then 'Network support coach focused on switching, security baselines, and exam readiness.'
    else 'CertPrep Academy development tutor profile.'
  end,
  case ranked_users.row_num
    when 1 then array['CCNA', 'Routing', 'OSPF', 'Troubleshooting']::text[]
    when 2 then array['CCNA', 'Switching', 'Security', 'Labs']::text[]
    else array['CCNA']::text[]
  end,
  true
from ranked_users
where ranked_users.row_num <= 2
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  bio = excluded.bio,
  expertise = excluded.expertise,
  is_active = excluded.is_active;

-- ==============================
-- Phase 8: Billing foundation
-- Source: supabase\migrations\20260309_phase8_billing_foundation.sql
-- ==============================
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_amount integer not null default 0 check (price_amount >= 0),
  price_currency text not null default 'USD',
  billing_interval text not null default 'none'
    check (billing_interval in ('none', 'month', 'year')),
  is_active boolean not null default true,
  features_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'trialing', 'canceled', 'expired', 'past_due')),
  provider text not null default 'dev_checkout'
    check (provider in ('dev_checkout')),
  provider_customer_id text null,
  provider_subscription_id text null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  provider text not null default 'dev_checkout'
    check (provider in ('dev_checkout')),
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_plans_slug on public.plans(slug);
create index if not exists idx_plans_is_active on public.plans(is_active);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_plan_id on public.user_subscriptions(plan_id);
create index if not exists idx_user_subscriptions_status on public.user_subscriptions(status);
create unique index if not exists idx_user_subscriptions_provider_subscription_id
  on public.user_subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;
create index if not exists idx_payment_events_user_id on public.payment_events(user_id);
create index if not exists idx_payment_events_provider on public.payment_events(provider);
create unique index if not exists idx_payment_events_provider_event_type_token
  on public.payment_events(provider, event_type, md5(event_payload::text));

drop trigger if exists trg_user_subscriptions_updated_at on public.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row
execute function public.set_updated_at_timestamp();

alter table public.plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "plans_select_active_for_all_authenticated" on public.plans;
create policy "plans_select_active_for_all_authenticated"
on public.plans
for select
to authenticated
using (is_active = true);

drop policy if exists "plans_select_active_for_anon" on public.plans;
create policy "plans_select_active_for_anon"
on public.plans
for select
to anon
using (is_active = true);

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
on public.user_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_subscriptions_insert_own" on public.user_subscriptions;
create policy "user_subscriptions_insert_own"
on public.user_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_subscriptions_update_own" on public.user_subscriptions;
create policy "user_subscriptions_update_own"
on public.user_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "payment_events_select_own_or_unbound" on public.payment_events;
create policy "payment_events_select_own_or_unbound"
on public.payment_events
for select
to authenticated
using (user_id is null or auth.uid() = user_id);

drop policy if exists "payment_events_insert_own_or_unbound" on public.payment_events;
create policy "payment_events_insert_own_or_unbound"
on public.payment_events
for insert
to authenticated
with check (user_id is null or auth.uid() = user_id);

grant select on public.plans to anon, authenticated;
grant select, insert, update on public.user_subscriptions to authenticated;
grant select, insert on public.payment_events to authenticated;

-- ==============================
-- Phase 8: Billing plan seed data
-- Source: supabase\seeds\20260309_billing_plans_seed.sql
-- ==============================
insert into public.plans (
  name,
  slug,
  description,
  price_amount,
  price_currency,
  billing_interval,
  is_active,
  features_json
)
values
  (
    'Free',
    'free',
    'Core lesson access with a limited self-study preview.',
    0,
    'USD',
    'none',
    true,
    jsonb_build_object(
      'full_quiz_access', false,
      'exam_simulator_access', false,
      'lab_access', false,
      'cli_access', false,
      'tutor_support_access', false
    )
  ),
  (
    'Premium',
    'premium',
    'Full self-study access across quizzes, labs, CLI practice, and exam simulator.',
    2900,
    'USD',
    'month',
    true,
    jsonb_build_object(
      'full_quiz_access', true,
      'exam_simulator_access', true,
      'lab_access', true,
      'cli_access', true,
      'tutor_support_access', false
    )
  ),
  (
    'Tutor Plan',
    'tutor-plan',
    'Premium learning access plus tutor support and tutor directory access.',
    5900,
    'USD',
    'month',
    true,
    jsonb_build_object(
      'full_quiz_access', true,
      'exam_simulator_access', true,
      'lab_access', true,
      'cli_access', true,
      'tutor_support_access', true
    )
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  price_amount = excluded.price_amount,
  price_currency = excluded.price_currency,
  billing_interval = excluded.billing_interval,
  is_active = excluded.is_active,
  features_json = excluded.features_json;

-- ==============================
-- Phase 9: Guidance foundation
-- Source: supabase\migrations\20260309_phase9_guidance_foundation.sql
-- ==============================
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  study_plan_id uuid not null references public.study_plans(id) on delete cascade,
  item_type text not null,
  module_id uuid null references public.modules(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_id uuid null references public.quizzes(id) on delete set null,
  exam_config_id uuid null references public.exam_configs(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  title text not null,
  description text not null default '',
  action_label text not null default 'Open',
  order_index integer not null default 1,
  is_completed boolean not null default false,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learner_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_type text not null,
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  module_id uuid null references public.modules(id) on delete set null,
  lesson_id uuid null references public.lessons(id) on delete set null,
  quiz_id uuid null references public.quizzes(id) on delete set null,
  exam_config_id uuid null references public.exam_configs(id) on delete set null,
  lab_id uuid null references public.labs(id) on delete set null,
  cli_challenge_id uuid null references public.cli_challenges(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  title text not null,
  description text not null default '',
  rationale text not null default '',
  is_dismissed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_study_plans_user_status
  on public.study_plans (user_id, status, updated_at desc);

create index if not exists idx_study_plan_items_plan_order
  on public.study_plan_items (study_plan_id, order_index);

create index if not exists idx_learner_recommendations_user_dismissed
  on public.learner_recommendations (user_id, is_dismissed, created_at desc);

create unique index if not exists idx_one_active_study_plan_per_user
  on public.study_plans (user_id)
  where status = 'active';

drop trigger if exists set_study_plans_updated_at on public.study_plans;
create trigger set_study_plans_updated_at
before update on public.study_plans
for each row
execute function public.set_updated_at_timestamp();

alter table public.study_plans enable row level security;
alter table public.study_plan_items enable row level security;
alter table public.learner_recommendations enable row level security;

drop policy if exists "Users can manage own study plans" on public.study_plans;
create policy "Users can manage own study plans"
on public.study_plans
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own study plan items" on public.study_plan_items;
create policy "Users can manage own study plan items"
on public.study_plan_items
for all
to authenticated
using (
  exists (
    select 1
    from public.study_plans
    where public.study_plans.id = study_plan_items.study_plan_id
      and public.study_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.study_plans
    where public.study_plans.id = study_plan_items.study_plan_id
      and public.study_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own learner recommendations" on public.learner_recommendations;
create policy "Users can manage own learner recommendations"
on public.learner_recommendations
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.study_plans to authenticated;
grant select, insert, update, delete on public.study_plan_items to authenticated;
grant select, insert, update, delete on public.learner_recommendations to authenticated;


-- ==============================
-- Phase 10: Admin authorization and content operations foundation
-- Source: supabase\migrations\20260310_phase10_admin_content_ops.sql
-- ==============================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'learner'
    check (role in ('admin', 'tutor', 'learner')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role on public.user_roles(role);

alter table public.user_roles enable row level security;

create or replace function public.get_app_role(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.user_roles
      where user_id = target_user_id
      limit 1
    ),
    'learner'
  );
$$;

alter table public.operation_automation_acknowledgements
  add column if not exists assigned_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz null,
  add column if not exists remind_at timestamptz null,
  add column if not exists reminder_state text not null default 'none',
  add column if not exists last_reminded_at timestamptz null,
  add column if not exists reminder_dismissed_at timestamptz null,
  add column if not exists reminder_snoozed_until timestamptz null,
  add column if not exists reminder_snooze_reason text null,
  add column if not exists reminder_last_action text not null default 'none',
  add column if not exists rerun_outcome text null,
  add column if not exists last_rerun_at timestamptz null,
  add column if not exists verification_state text not null default 'not_ready',
  add column if not exists verification_summary text null,
  add column if not exists verification_status text not null default 'not_started',
  add column if not exists verification_completed_at timestamptz null,
  add column if not exists verification_completed_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists verification_notes text null;

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_reminder_state_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_reminder_state_check
  check (reminder_state in ('none', 'scheduled', 'sent', 'dismissed'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_rerun_outcome_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_rerun_outcome_check
  check (rerun_outcome is null or rerun_outcome in ('success', 'skipped', 'failed'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_verification_state_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_verification_state_check
  check (verification_state in ('not_ready', 'needs_review', 'verified'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_reminder_last_action_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_reminder_last_action_check
  check (reminder_last_action in ('none', 'scheduled', 'rescheduled', 'dismissed', 'snoozed', 'sent'));

alter table public.operation_automation_acknowledgements
  drop constraint if exists operation_automation_acknowledgements_verification_status_check;

alter table public.operation_automation_acknowledgements
  add constraint operation_automation_acknowledgements_verification_status_check
  check (verification_status in ('not_started', 'pending', 'completed', 'failed'));

create index if not exists idx_operation_automation_acknowledgements_assigned_admin_created_at
  on public.operation_automation_acknowledgements(assigned_admin_user_id, created_at desc);

create index if not exists idx_operation_automation_acknowledgements_remind_at
  on public.operation_automation_acknowledgements(reminder_state, remind_at);

create index if not exists idx_operation_automation_acknowledgements_verification_status
  on public.operation_automation_acknowledgements(verification_status, created_at desc);

create index if not exists idx_operation_automation_acknowledgements_reminder_snoozed_until
  on public.operation_automation_acknowledgements(reminder_snoozed_until);

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'subscription_digest_generated',
      'automation_muted',
      'automation_unmuted',
      'automation_snoozed',
      'automation_resumed',
      'automation_acknowledgement_updated',
      'automation_rerun_recorded',
      'automation_verification_updated',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned',
      'operation_watch_update',
      'operation_subscription_match',
      'automation_acknowledgement_assignment',
      'automation_acknowledgement_reminder',
      'automation_acknowledgement_overdue',
      'automation_verification_needed'
    )
  );

-- Phase 23: bulk subscription management and escalation rules

create table if not exists public.operation_escalation_rules (
  id uuid primary key default gen_random_uuid(),
  created_by_admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  escalation_reason text not null check (length(trim(escalation_reason)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_escalation_rules_unique_name
  on public.operation_escalation_rules(created_by_admin_user_id, entity_type, lower(name));

create index if not exists idx_operation_escalation_rules_admin_entity_updated_at
  on public.operation_escalation_rules(created_by_admin_user_id, entity_type, updated_at desc);

drop trigger if exists trg_operation_escalation_rules_updated_at on public.operation_escalation_rules;
create trigger trg_operation_escalation_rules_updated_at
before update on public.operation_escalation_rules
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_escalation_rules enable row level security;

drop policy if exists "operation_escalation_rules_select_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_select_own_admin"
on public.operation_escalation_rules
for select
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_insert_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_insert_own_admin"
on public.operation_escalation_rules
for insert
to authenticated
with check (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_update_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_update_own_admin"
on public.operation_escalation_rules
for update
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid())
with check (public.is_admin() and created_by_admin_user_id = auth.uid());

drop policy if exists "operation_escalation_rules_delete_own_admin" on public.operation_escalation_rules;
create policy "operation_escalation_rules_delete_own_admin"
on public.operation_escalation_rules
for delete
to authenticated
using (public.is_admin() and created_by_admin_user_id = auth.uid());

grant select, insert, update, delete on public.operation_escalation_rules to authenticated;

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );

-- Phase 24: automated escalation rules and subscription digests

alter table public.operation_escalation_rules
  add column if not exists run_mode text not null default 'manual'
    check (run_mode in ('manual', 'automated')),
  add column if not exists last_run_at timestamptz null,
  add column if not exists next_run_at timestamptz null,
  add column if not exists cooldown_minutes integer not null default 30
    check (cooldown_minutes >= 0),
  add column if not exists max_matches_per_run integer not null default 25
    check (max_matches_per_run >= 1);

alter table public.operation_queue_subscriptions
  add column if not exists digest_cooldown_minutes integer not null default 180
    check (digest_cooldown_minutes >= 0),
  add column if not exists last_digest_at timestamptz null,
  add column if not exists last_digest_hash text null;

create table if not exists public.operation_escalation_rule_runs (
  id uuid primary key default gen_random_uuid(),
  operation_escalation_rule_id uuid not null references public.operation_escalation_rules(id) on delete cascade,
  triggered_by text not null check (triggered_by in ('manual', 'automation')),
  triggered_by_admin_user_id uuid null references auth.users(id) on delete set null,
  matched_count integer not null default 0 check (matched_count >= 0),
  escalated_count integer not null default 0 check (escalated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  run_summary text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_escalation_rule_runs_rule_created_at
  on public.operation_escalation_rule_runs(operation_escalation_rule_id, created_at desc);

create table if not exists public.operation_subscription_digest_runs (
  id uuid primary key default gen_random_uuid(),
  operation_queue_subscription_id uuid not null references public.operation_queue_subscriptions(id) on delete cascade,
  match_count integer not null default 0 check (match_count >= 0),
  digest_summary text not null default '',
  delivered_via text not null default 'in_app' check (delivered_via in ('in_app')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_subscription_digest_runs_subscription_created_at
  on public.operation_subscription_digest_runs(operation_queue_subscription_id, created_at desc);

alter table public.operation_escalation_rule_runs enable row level security;
alter table public.operation_subscription_digest_runs enable row level security;

drop policy if exists "operation_escalation_rule_runs_select_own_admin" on public.operation_escalation_rule_runs;
create policy "operation_escalation_rule_runs_select_own_admin"
on public.operation_escalation_rule_runs
for select
to authenticated
using (
  public.is_admin() and exists (
    select 1
    from public.operation_escalation_rules rules
    where rules.id = operation_escalation_rule_runs.operation_escalation_rule_id
      and rules.created_by_admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_escalation_rule_runs_insert_own_admin" on public.operation_escalation_rule_runs;
create policy "operation_escalation_rule_runs_insert_own_admin"
on public.operation_escalation_rule_runs
for insert
to authenticated
with check (
  public.is_admin() and exists (
    select 1
    from public.operation_escalation_rules rules
    where rules.id = operation_escalation_rule_runs.operation_escalation_rule_id
      and rules.created_by_admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_subscription_digest_runs_select_own_admin" on public.operation_subscription_digest_runs;
create policy "operation_subscription_digest_runs_select_own_admin"
on public.operation_subscription_digest_runs
for select
to authenticated
using (
  public.is_admin() and exists (
    select 1
    from public.operation_queue_subscriptions subscriptions
    where subscriptions.id = operation_subscription_digest_runs.operation_queue_subscription_id
      and subscriptions.admin_user_id = auth.uid()
  )
);

drop policy if exists "operation_subscription_digest_runs_insert_own_admin" on public.operation_subscription_digest_runs;
create policy "operation_subscription_digest_runs_insert_own_admin"
on public.operation_subscription_digest_runs
for insert
to authenticated
with check (
  public.is_admin() and exists (
    select 1
    from public.operation_queue_subscriptions subscriptions
    where subscriptions.id = operation_subscription_digest_runs.operation_queue_subscription_id
      and subscriptions.admin_user_id = auth.uid()
  )
);

grant select, insert on public.operation_escalation_rule_runs to authenticated;
grant select, insert on public.operation_subscription_digest_runs to authenticated;

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'subscription_digest_generated',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );

-- Phase 25: automation control polish and execution health

alter table public.operation_escalation_rules
  add column if not exists is_muted boolean not null default false,
  add column if not exists snoozed_until timestamptz null,
  add column if not exists muted_or_snoozed_reason text null,
  add column if not exists consecutive_skip_count integer not null default 0
    check (consecutive_skip_count >= 0),
  add column if not exists consecutive_failure_count integer not null default 0
    check (consecutive_failure_count >= 0),
  add column if not exists last_success_at timestamptz null,
  add column if not exists last_failure_at timestamptz null,
  add column if not exists last_skip_reason text null;

alter table public.operation_queue_subscriptions
  add column if not exists is_muted boolean not null default false,
  add column if not exists snoozed_until timestamptz null,
  add column if not exists muted_or_snoozed_reason text null,
  add column if not exists consecutive_skip_count integer not null default 0
    check (consecutive_skip_count >= 0),
  add column if not exists consecutive_failure_count integer not null default 0
    check (consecutive_failure_count >= 0),
  add column if not exists last_success_at timestamptz null,
  add column if not exists last_failure_at timestamptz null,
  add column if not exists last_skip_reason text null;

alter table public.operation_escalation_rule_runs
  add column if not exists run_status text not null default 'success'
    check (run_status in ('success', 'skipped', 'failed')),
  add column if not exists skip_reason text null,
  add column if not exists failure_reason text null,
  add column if not exists duration_ms integer null
    check (duration_ms >= 0);

alter table public.operation_subscription_digest_runs
  add column if not exists triggered_by text not null default 'manual'
    check (triggered_by in ('manual', 'automation')),
  add column if not exists triggered_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists run_status text not null default 'success'
    check (run_status in ('success', 'skipped', 'failed')),
  add column if not exists skip_reason text null,
  add column if not exists failure_reason text null,
  add column if not exists duration_ms integer null
    check (duration_ms >= 0);

create index if not exists idx_operation_escalation_rules_is_muted
  on public.operation_escalation_rules(created_by_admin_user_id, is_muted, updated_at desc);

create index if not exists idx_operation_queue_subscriptions_is_muted
  on public.operation_queue_subscriptions(admin_user_id, is_muted, updated_at desc);

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'subscription_digest_generated',
      'escalation_rule_created',
      'escalation_rule_updated',
      'escalation_rule_deleted',
      'escalation_rule_toggled',
      'escalation_rule_applied',
      'escalation_rule_run_recorded',
      'automation_muted',
      'automation_unmuted',
      'automation_snoozed',
      'automation_resumed',
      'automation_acknowledgement_updated',
      'bulk_subscription_activated',
      'bulk_subscription_deactivated',
      'bulk_subscription_deleted',
      'bulk_subscription_duplicated',
      'note_added'
    )
  );

create table if not exists public.operation_automation_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('operation_escalation_rule', 'operation_queue_subscription')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null
    check (
      status in (
        'unacknowledged',
        'acknowledged',
        'investigating',
        'fixed_pending_rerun',
        'resolved'
      )
    ),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_automation_acknowledgements_entity_created_at
  on public.operation_automation_acknowledgements(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_automation_acknowledgements_admin_created_at
  on public.operation_automation_acknowledgements(admin_user_id, created_at desc);

alter table public.operation_automation_acknowledgements enable row level security;

drop policy if exists "operation_automation_acknowledgements_select_admin"
  on public.operation_automation_acknowledgements;
create policy "operation_automation_acknowledgements_select_admin"
on public.operation_automation_acknowledgements
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_automation_acknowledgements_insert_admin"
  on public.operation_automation_acknowledgements;
create policy "operation_automation_acknowledgements_insert_admin"
on public.operation_automation_acknowledgements
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_automation_acknowledgements to authenticated;

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_entity_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_entity_type_check
  check (
    entity_type in (
      'notification_delivery',
      'scheduled_job',
      'operation_escalation_rule',
      'operation_queue_subscription'
    )
  );

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.get_app_role(auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin';
$$;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'learner')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Phase 22: queue subscriptions, escalation state, and team-follow signals

create table if not exists public.operation_queue_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_queue_subscriptions_unique_name
  on public.operation_queue_subscriptions(admin_user_id, entity_type, lower(name));

create index if not exists idx_operation_queue_subscriptions_admin_entity_updated_at
  on public.operation_queue_subscriptions(admin_user_id, entity_type, updated_at desc);

drop trigger if exists trg_operation_queue_subscriptions_updated_at on public.operation_queue_subscriptions;
create trigger trg_operation_queue_subscriptions_updated_at
before update on public.operation_queue_subscriptions
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_queue_subscriptions enable row level security;

drop policy if exists "operation_queue_subscriptions_select_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_select_own_admin"
on public.operation_queue_subscriptions
for select
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_insert_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_insert_own_admin"
on public.operation_queue_subscriptions
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_update_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_update_own_admin"
on public.operation_queue_subscriptions
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_queue_subscriptions_delete_own_admin" on public.operation_queue_subscriptions;
create policy "operation_queue_subscriptions_delete_own_admin"
on public.operation_queue_subscriptions
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

grant select, insert, update, delete on public.operation_queue_subscriptions to authenticated;

alter table public.notification_deliveries
  add column if not exists is_escalated boolean not null default false,
  add column if not exists escalated_at timestamptz null,
  add column if not exists escalated_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists escalation_reason text null;

alter table public.scheduled_jobs
  add column if not exists is_escalated boolean not null default false,
  add column if not exists escalated_at timestamptz null,
  add column if not exists escalated_by_admin_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists escalation_reason text null;

create index if not exists idx_notification_deliveries_escalated
  on public.notification_deliveries(is_escalated, assigned_admin_user_id, created_at desc);

create index if not exists idx_scheduled_jobs_escalated
  on public.scheduled_jobs(is_escalated, assigned_admin_user_id, created_at desc);

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned',
      'operation_watch_update',
      'operation_subscription_match'
    )
  );

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'escalated',
      'deescalated',
      'subscription_created',
      'subscription_updated',
      'subscription_deleted',
      'subscription_toggled',
      'subscription_match_notified',
      'note_added'
    )
  );

create or replace function public.enqueue_notification_delivery_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if new.user_id is null then
    return new;
  end if;

  if new.type not in (
    'session_booked',
    'session_confirmed',
    'session_canceled',
    'session_reminder',
    'session_completed',
    'followup_added'
  ) then
    return new;
  end if;

  if not public.notification_channel_enabled(new.user_id, 'email', new.type) then
    return new;
  end if;

  select email
  into target_email
  from auth.users
  where id = new.user_id;

  if target_email is null or length(trim(target_email)) = 0 then
    return new;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    user_id,
    channel,
    template_key,
    status,
    retry_count,
    max_retries,
    next_attempt_at
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending',
    0,
    3,
    timezone('utc', now())
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_role on auth.users;
create trigger trg_auth_user_role
after insert on auth.users
for each row
execute function public.handle_new_user_role();

insert into public.user_roles (user_id, role)
select id, 'learner'
from auth.users
on conflict (user_id) do nothing;

update public.user_roles
set role = 'tutor',
    updated_at = timezone('utc', now())
where role = 'learner'
  and user_id in (
    select user_id
    from public.tutor_profiles
  );

drop policy if exists "user_roles_select_self_or_admin" on public.user_roles;
create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete on public.user_roles to authenticated;
grant execute on function public.get_app_role(uuid) to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.certifications
  add column if not exists is_published boolean not null default false;

alter table public.modules
  add column if not exists is_published boolean not null default false;

alter table public.lessons
  add column if not exists is_published boolean not null default false;

create index if not exists idx_certifications_is_published on public.certifications(is_published);
create index if not exists idx_modules_is_published on public.modules(is_published);
create index if not exists idx_lessons_is_published on public.lessons(is_published);

update public.certifications
set is_published = true
where exists (
  select 1
  from public.courses
  where courses.certification_id = certifications.id
    and courses.is_published = true
);

update public.modules
set is_published = true
where exists (
  select 1
  from public.courses
  where courses.id = modules.course_id
    and courses.is_published = true
);

update public.lessons
set is_published = true
where exists (
  select 1
  from public.modules
  where modules.id = lessons.module_id
    and modules.is_published = true
);

drop policy if exists "certifications_select_authenticated" on public.certifications;
drop policy if exists "courses_select_authenticated" on public.courses;
drop policy if exists "modules_select_authenticated" on public.modules;
drop policy if exists "lessons_select_authenticated" on public.lessons;
drop policy if exists "certifications_select_published_authenticated" on public.certifications;
drop policy if exists "courses_select_published_authenticated" on public.courses;
drop policy if exists "modules_select_published_authenticated" on public.modules;
drop policy if exists "lessons_select_published_authenticated" on public.lessons;
drop policy if exists "quizzes_select_published_authenticated" on public.quizzes;
drop policy if exists "labs_select_published_authenticated" on public.labs;
drop policy if exists "cli_challenges_select_published_authenticated" on public.cli_challenges;
drop policy if exists "tutor_profiles_select_active_authenticated" on public.tutor_profiles;
drop policy if exists "plans_select_active_for_all_authenticated" on public.plans;

create policy "certifications_select_published_authenticated"
on public.certifications
for select
to authenticated
using (is_published = true);

create policy "courses_select_published_authenticated"
on public.courses
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.certifications
    where certifications.id = certification_id
      and certifications.is_published = true
  )
);

create policy "modules_select_published_authenticated"
on public.modules
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.courses
    join public.certifications
      on certifications.id = courses.certification_id
    where courses.id = course_id
      and courses.is_published = true
      and certifications.is_published = true
  )
);

create policy "lessons_select_published_authenticated"
on public.lessons
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
);

create policy "quizzes_select_published_authenticated"
on public.quizzes
for select
to authenticated
using (
  is_published = true
  and (
    (
      module_id is not null
      and exists (
        select 1
        from public.modules
        join public.courses
          on courses.id = modules.course_id
        join public.certifications
          on certifications.id = courses.certification_id
        where modules.id = quizzes.module_id
          and modules.is_published = true
          and courses.is_published = true
          and certifications.is_published = true
      )
    )
    or
    (
      lesson_id is not null
      and exists (
        select 1
        from public.lessons
        join public.modules
          on modules.id = lessons.module_id
        join public.courses
          on courses.id = modules.course_id
        join public.certifications
          on certifications.id = courses.certification_id
        where lessons.id = quizzes.lesson_id
          and lessons.is_published = true
          and modules.is_published = true
          and courses.is_published = true
          and certifications.is_published = true
      )
    )
  )
);

create policy "labs_select_published_authenticated"
on public.labs
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = labs.module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = labs.lesson_id
        and lessons.is_published = true
    )
  )
);

create policy "cli_challenges_select_published_authenticated"
on public.cli_challenges
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    join public.certifications
      on certifications.id = courses.certification_id
    where modules.id = cli_challenges.module_id
      and modules.is_published = true
      and courses.is_published = true
      and certifications.is_published = true
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons
      where lessons.id = cli_challenges.lesson_id
        and lessons.is_published = true
    )
  )
);

create policy "tutor_profiles_select_active_authenticated"
on public.tutor_profiles
for select
to authenticated
using (is_active = true);

create policy "plans_select_active_for_all_authenticated"
on public.plans
for select
to authenticated
using (is_active = true);

drop policy if exists "certifications_admin_all" on public.certifications;
create policy "certifications_admin_all"
on public.certifications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_admin_all" on public.courses;
create policy "courses_admin_all"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "modules_admin_all" on public.modules;
create policy "modules_admin_all"
on public.modules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all"
on public.lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quizzes_admin_all" on public.quizzes;
create policy "quizzes_admin_all"
on public.quizzes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "labs_admin_all" on public.labs;
create policy "labs_admin_all"
on public.labs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cli_challenges_admin_all" on public.cli_challenges;
create policy "cli_challenges_admin_all"
on public.cli_challenges
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tutor_profiles_admin_all" on public.tutor_profiles;
create policy "tutor_profiles_admin_all"
on public.tutor_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "plans_admin_all" on public.plans;
create policy "plans_admin_all"
on public.plans
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.certifications to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.modules to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant select, insert, update, delete on public.quizzes to authenticated;
grant select, insert, update, delete on public.labs to authenticated;
grant select, insert, update, delete on public.cli_challenges to authenticated;
grant select, insert, update, delete on public.tutor_profiles to authenticated;
grant select, insert, update, delete on public.plans to authenticated;

-- After running this setup, promote at least one account manually:
-- update public.user_roles
-- set role = 'admin'
-- where user_id = 'YOUR_AUTH_USER_UUID';



-- Phase 11: Tutor scheduling and live session management foundation

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.current_active_tutor_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.tutor_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.is_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'tutor'
    and public.current_active_tutor_profile_id() is not null;
$$;

create or replace function public.sync_user_role_for_tutor_profile(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  has_active_tutor_profile boolean;
begin
  select exists (
    select 1
    from public.tutor_profiles
    where user_id = target_user_id
      and is_active = true
  )
  into has_active_tutor_profile;

  insert into public.user_roles (user_id, role)
  values (
    target_user_id,
    case when has_active_tutor_profile then 'tutor' else 'learner' end
  )
  on conflict (user_id) do update
  set role = case
      when public.user_roles.role = 'admin' then 'admin'
      when has_active_tutor_profile then 'tutor'
      else 'learner'
    end,
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.handle_tutor_profile_role_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_user_role_for_tutor_profile(old.user_id);
    return old;
  end if;

  perform public.sync_user_role_for_tutor_profile(new.user_id);

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.sync_user_role_for_tutor_profile(old.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tutor_profile_role_sync on public.tutor_profiles;
create trigger trg_tutor_profile_role_sync
after insert or update or delete on public.tutor_profiles
for each row
execute function public.handle_tutor_profile_role_sync();

do $$
declare
  tutor_user_id uuid;
begin
  for tutor_user_id in
    select distinct user_id
    from public.tutor_profiles
  loop
    perform public.sync_user_role_for_tutor_profile(tutor_user_id);
  end loop;
end;
$$;

create table if not exists public.tutor_availability_slots (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

create table if not exists public.tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  availability_slot_id uuid null references public.tutor_availability_slots(id) on delete set null,
  support_request_id uuid null references public.support_requests(id) on delete set null,
  subject text not null check (length(trim(subject)) > 0),
  category text not null default 'general'
    check (
      category in (
        'general',
        'lesson_clarification',
        'quiz_help',
        'exam_help',
        'lab_help',
        'cli_help'
      )
    ),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'canceled')),
  meeting_link text null,
  notes text null,
  scheduled_starts_at timestamptz not null,
  scheduled_ends_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (scheduled_ends_at > scheduled_starts_at)
);

create index if not exists idx_tutor_availability_slots_profile_starts
  on public.tutor_availability_slots(tutor_profile_id, starts_at);
create index if not exists idx_tutor_availability_slots_active_starts
  on public.tutor_availability_slots(is_active, starts_at);
create index if not exists idx_tutor_sessions_tutor_status_start
  on public.tutor_sessions(tutor_profile_id, status, scheduled_starts_at);
create index if not exists idx_tutor_sessions_learner_status_start
  on public.tutor_sessions(learner_user_id, status, scheduled_starts_at);
create index if not exists idx_tutor_sessions_support_request_id
  on public.tutor_sessions(support_request_id);
create unique index if not exists idx_tutor_sessions_slot_booking_unique
  on public.tutor_sessions(availability_slot_id)
  where availability_slot_id is not null
    and status in ('requested', 'confirmed', 'completed');

alter table public.tutor_availability_slots
  drop constraint if exists tutor_availability_slots_no_overlap;

alter table public.tutor_availability_slots
  add constraint tutor_availability_slots_no_overlap
  exclude using gist (
    tutor_profile_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (is_active);

create or replace function public.validate_tutor_availability_slot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ends_at <= new.starts_at then
    raise exception 'Availability end time must be after the start time.';
  end if;

  if new.starts_at < timezone('utc', now()) then
    raise exception 'Availability slots must be scheduled in the future.';
  end if;

  if tg_op = 'UPDATE'
    and old.is_active = true
    and new.is_active = false
    and exists (
      select 1
      from public.tutor_sessions ts
      where ts.availability_slot_id = old.id
        and ts.status in ('requested', 'confirmed')
    ) then
    raise exception 'Booked availability slots cannot be deactivated until the session is canceled or completed.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_tutor_session_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  slot_record public.tutor_availability_slots%rowtype;
  actor_tutor_profile_id uuid;
begin
  actor_tutor_profile_id := public.current_active_tutor_profile_id();

  if new.subject is null or length(trim(new.subject)) = 0 then
    raise exception 'Session subject is required.';
  end if;

  if new.scheduled_ends_at <= new.scheduled_starts_at then
    raise exception 'Session end time must be after the start time.';
  end if;

  if new.availability_slot_id is not null then
    select *
    into slot_record
    from public.tutor_availability_slots
    where id = new.availability_slot_id;

    if not found then
      raise exception 'The selected availability slot does not exist.';
    end if;

    if slot_record.tutor_profile_id <> new.tutor_profile_id then
      raise exception 'The selected availability slot belongs to a different tutor.';
    end if;

    if slot_record.starts_at <> new.scheduled_starts_at
      or slot_record.ends_at <> new.scheduled_ends_at then
      raise exception 'Session times must match the selected availability slot.';
    end if;

    if tg_op = 'INSERT' and slot_record.is_active = false then
      raise exception 'Inactive availability slots cannot be booked.';
    end if;
  end if;

  if new.status = 'completed' and new.scheduled_ends_at > timezone('utc', now()) then
    raise exception 'Sessions can only be marked completed after the scheduled end time.';
  end if;

  if tg_op = 'INSERT' then
    if new.availability_slot_id is null then
      raise exception 'Learner bookings must reference an availability slot.';
    end if;

    if auth.uid() is null or auth.uid() <> new.learner_user_id then
      raise exception 'Only the booking learner can create a tutor session.';
    end if;

    if new.status <> 'requested' then
      raise exception 'New tutor sessions must start in requested status.';
    end if;

    return new;
  end if;

  if old.status is distinct from new.status then
    case old.status
      when 'requested' then
        if new.status not in ('confirmed', 'canceled') then
          raise exception 'Requested sessions can only move to confirmed or canceled.';
        end if;
      when 'confirmed' then
        if new.status not in ('completed', 'canceled') then
          raise exception 'Confirmed sessions can only move to completed or canceled.';
        end if;
      when 'completed' then
        if new.status <> 'completed' then
          raise exception 'Completed sessions cannot change status again.';
        end if;
      when 'canceled' then
        if new.status <> 'canceled' then
          raise exception 'Canceled sessions cannot change status again.';
        end if;
    end case;
  end if;

  if auth.uid() = old.learner_user_id and actor_tutor_profile_id is null then
    if old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id
      or old.availability_slot_id is distinct from new.availability_slot_id
      or old.support_request_id is distinct from new.support_request_id
      or old.subject is distinct from new.subject
      or old.category is distinct from new.category
      or old.meeting_link is distinct from new.meeting_link
      or old.notes is distinct from new.notes
      or old.scheduled_starts_at is distinct from new.scheduled_starts_at
      or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
      raise exception 'Learners can only cancel their own tutor sessions.';
    end if;

    if old.status = 'canceled' or new.status <> 'canceled' then
      raise exception 'Learners can only move a session into canceled status.';
    end if;

    return new;
  end if;

  if actor_tutor_profile_id = old.tutor_profile_id then
    if old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id
      or old.availability_slot_id is distinct from new.availability_slot_id
      or old.support_request_id is distinct from new.support_request_id
      or old.subject is distinct from new.subject
      or old.category is distinct from new.category
      or old.scheduled_starts_at is distinct from new.scheduled_starts_at
      or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
      raise exception 'Tutors cannot reassign or reschedule booked sessions.';
    end if;

    return new;
  end if;

  raise exception 'Unauthorized tutor session update.';
end;
$$;

drop trigger if exists trg_tutor_availability_slots_updated_at on public.tutor_availability_slots;
create trigger trg_tutor_availability_slots_updated_at
before update on public.tutor_availability_slots
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_tutor_sessions_updated_at on public.tutor_sessions;
create trigger trg_tutor_sessions_updated_at
before update on public.tutor_sessions
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_validate_tutor_availability_slot on public.tutor_availability_slots;
create trigger trg_validate_tutor_availability_slot
before insert or update on public.tutor_availability_slots
for each row
execute function public.validate_tutor_availability_slot();

drop trigger if exists trg_validate_tutor_session_write on public.tutor_sessions;
create trigger trg_validate_tutor_session_write
before insert or update on public.tutor_sessions
for each row
execute function public.validate_tutor_session_write();

alter table public.tutor_availability_slots enable row level security;
alter table public.tutor_sessions enable row level security;

drop policy if exists "tutor_availability_slots_select_accessible" on public.tutor_availability_slots;
create policy "tutor_availability_slots_select_accessible"
on public.tutor_availability_slots
for select
to authenticated
using (
  (
    is_active = true
    and ends_at >= timezone('utc', now())
    and exists (
      select 1
      from public.tutor_profiles tp
      where tp.id = tutor_availability_slots.tutor_profile_id
        and tp.is_active = true
    )
  )
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_availability_slots_insert_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_insert_own"
on public.tutor_availability_slots
for insert
to authenticated
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_availability_slots_update_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_update_own"
on public.tutor_availability_slots
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_availability_slots_delete_own" on public.tutor_availability_slots;
create policy "tutor_availability_slots_delete_own"
on public.tutor_availability_slots
for delete
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_sessions_select_accessible" on public.tutor_sessions;
create policy "tutor_sessions_select_accessible"
on public.tutor_sessions
for select
to authenticated
using (
  learner_user_id = auth.uid()
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_sessions_insert_learner_booking" on public.tutor_sessions;
create policy "tutor_sessions_insert_learner_booking"
on public.tutor_sessions
for insert
to authenticated
with check (
  learner_user_id = auth.uid()
  and exists (
    select 1
    from public.tutor_profiles tp
    where tp.id = tutor_sessions.tutor_profile_id
      and tp.is_active = true
  )
  and (
    availability_slot_id is null
    or exists (
      select 1
      from public.tutor_availability_slots tas
      where tas.id = tutor_sessions.availability_slot_id
        and tas.tutor_profile_id = tutor_sessions.tutor_profile_id
        and tas.is_active = true
        and tas.starts_at = tutor_sessions.scheduled_starts_at
        and tas.ends_at = tutor_sessions.scheduled_ends_at
        and not exists (
          select 1
          from public.tutor_sessions existing_session
          where existing_session.availability_slot_id = tas.id
            and existing_session.status in ('requested', 'confirmed', 'completed')
        )
    )
  )
  and (
    support_request_id is null
    or exists (
      select 1
      from public.support_requests sr
      where sr.id = tutor_sessions.support_request_id
        and sr.learner_user_id = auth.uid()
    )
  )
);

drop policy if exists "tutor_sessions_update_learner_owned" on public.tutor_sessions;
create policy "tutor_sessions_update_learner_owned"
on public.tutor_sessions
for update
to authenticated
using (learner_user_id = auth.uid())
with check (learner_user_id = auth.uid());

drop policy if exists "tutor_sessions_update_tutor_owned" on public.tutor_sessions;
create policy "tutor_sessions_update_tutor_owned"
on public.tutor_sessions
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

grant execute on function public.current_active_tutor_profile_id() to authenticated;
grant execute on function public.is_tutor() to authenticated;
revoke execute on function public.sync_user_role_for_tutor_profile(uuid) from authenticated;
grant select, insert, update, delete on public.tutor_availability_slots to authenticated;
grant select, insert, update on public.tutor_sessions to authenticated;



-- Phase 12: In-app notifications and tutor session follow-ups

create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (
      type in (
        'session_booked',
        'session_confirmed',
        'session_canceled',
        'session_reminder',
        'session_completed',
        'followup_added'
      )
    ),
  title text not null check (length(trim(title)) > 0),
  message text not null check (length(trim(message)) > 0),
  link_url text null,
  dedupe_key text null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tutor_session_followups (
  id uuid primary key default gen_random_uuid(),
  tutor_session_id uuid not null unique references public.tutor_sessions(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null check (length(trim(summary)) > 0),
  recommendations text null,
  homework text null,
  next_steps text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notifications_user_created_at
  on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_is_read
  on public.notifications(user_id, is_read);
create unique index if not exists idx_notifications_dedupe_key
  on public.notifications(dedupe_key)
  where dedupe_key is not null;
create index if not exists idx_tutor_session_followups_tutor_profile_id
  on public.tutor_session_followups(tutor_profile_id);
create index if not exists idx_tutor_session_followups_learner_user_id
  on public.tutor_session_followups(learner_user_id);

create or replace function public.insert_notification_record(
  target_user_id uuid,
  target_type text,
  target_title text,
  target_message text,
  target_link_url text,
  target_dedupe_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    dedupe_key,
    is_read
  )
  values (
    target_user_id,
    target_type,
    target_title,
    target_message,
    target_link_url,
    target_dedupe_key,
    false
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

create or replace function public.validate_tutor_session_followup_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_record public.tutor_sessions%rowtype;
begin
  select *
  into session_record
  from public.tutor_sessions
  where id = new.tutor_session_id;

  if not found then
    raise exception 'Tutor session follow-up must reference a valid session.';
  end if;

  if session_record.status <> 'completed' then
    raise exception 'Follow-ups can only be saved for completed tutor sessions.';
  end if;

  if session_record.tutor_profile_id <> new.tutor_profile_id then
    raise exception 'Follow-up tutor ownership does not match the session.';
  end if;

  if session_record.learner_user_id <> new.learner_user_id then
    raise exception 'Follow-up learner ownership does not match the session.';
  end if;

  if new.summary is null or length(trim(new.summary)) = 0 then
    raise exception 'Follow-up summary is required.';
  end if;

  if tg_op = 'UPDATE' then
    if old.tutor_session_id is distinct from new.tutor_session_id
      or old.tutor_profile_id is distinct from new.tutor_profile_id
      or old.learner_user_id is distinct from new.learner_user_id then
      raise exception 'Follow-ups cannot be reassigned to a different tutor session.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tutor_user_id uuid;
  session_label text;
  learner_canceled boolean;
begin
  select user_id
  into tutor_user_id
  from public.tutor_profiles
  where id = coalesce(new.tutor_profile_id, old.tutor_profile_id);

  session_label := coalesce(new.subject, old.subject, 'Tutor session');

  if tg_op = 'INSERT' then
    if tutor_user_id is not null then
      perform public.insert_notification_record(
        tutor_user_id,
        'session_booked',
        'New tutor session request',
        format('A learner booked "%s". Review the request in your tutor session queue.', session_label),
        '/tutor/sessions',
        format('session-booked:%s:%s', new.id, tutor_user_id)
      );
    end if;

    return new;
  end if;

  learner_canceled := auth.uid() = old.learner_user_id;

  if old.status is distinct from new.status then
    if new.status = 'confirmed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_confirmed',
        'Tutor session confirmed',
        format('Your session "%s" was confirmed by the tutor.', session_label),
        '/sessions',
        format('session-confirmed:%s:%s', new.id, new.learner_user_id)
      );
    elsif new.status = 'canceled' then
      if learner_canceled then
        if tutor_user_id is not null then
          perform public.insert_notification_record(
            tutor_user_id,
            'session_canceled',
            'Learner canceled a session',
            format('The learner canceled "%s".', session_label),
            '/tutor/sessions',
            format('session-canceled-learner:%s:%s', new.id, tutor_user_id)
          );
        end if;
      else
        perform public.insert_notification_record(
          new.learner_user_id,
          'session_canceled',
          'Tutor session canceled',
          format('Your tutor canceled "%s".', session_label),
          '/sessions',
          format('session-canceled-tutor:%s:%s', new.id, new.learner_user_id)
        );
      end if;
    elsif new.status = 'completed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_completed',
        'Tutor session completed',
        format('Your session "%s" has been marked completed.', session_label),
        '/sessions',
        format('session-completed:%s:%s', new.id, new.learner_user_id)
      );
    end if;
  end if;

  if old.meeting_link is distinct from new.meeting_link
    and new.meeting_link is not null
    and length(trim(new.meeting_link)) > 0 then
    perform public.insert_notification_record(
      new.learner_user_id,
      'session_confirmed',
      'Meeting link available',
      format('A meeting link was added for "%s".', session_label),
      '/sessions',
      format('meeting-link-added:%s:%s', new.id, new.learner_user_id)
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_followup_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_subject text;
begin
  select subject
  into session_subject
  from public.tutor_sessions
  where id = new.tutor_session_id;

  perform public.insert_notification_record(
    new.learner_user_id,
    'followup_added',
    'Tutor follow-up available',
    format('A tutor follow-up was added for "%s".', coalesce(session_subject, 'your session')),
    '/sessions',
    format('followup-added:%s:%s', new.tutor_session_id, new.learner_user_id)
  );

  return new;
end;
$$;

drop trigger if exists trg_tutor_session_followups_updated_at on public.tutor_session_followups;
create trigger trg_tutor_session_followups_updated_at
before update on public.tutor_session_followups
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_validate_tutor_session_followup_write on public.tutor_session_followups;
create trigger trg_validate_tutor_session_followup_write
before insert or update on public.tutor_session_followups
for each row
execute function public.validate_tutor_session_followup_write();

drop trigger if exists trg_tutor_session_notifications on public.tutor_sessions;
create trigger trg_tutor_session_notifications
after insert or update on public.tutor_sessions
for each row
execute function public.handle_tutor_session_notifications();

drop trigger if exists trg_tutor_session_followup_notifications on public.tutor_session_followups;
create trigger trg_tutor_session_followup_notifications
after insert on public.tutor_session_followups
for each row
execute function public.handle_tutor_session_followup_notifications();

alter table public.notifications enable row level security;
alter table public.tutor_session_followups enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tutor_session_followups_select_accessible" on public.tutor_session_followups;
create policy "tutor_session_followups_select_accessible"
on public.tutor_session_followups
for select
to authenticated
using (
  learner_user_id = auth.uid()
  or tutor_profile_id = public.current_active_tutor_profile_id()
);

drop policy if exists "tutor_session_followups_insert_tutor_owned" on public.tutor_session_followups;
create policy "tutor_session_followups_insert_tutor_owned"
on public.tutor_session_followups
for insert
to authenticated
with check (tutor_profile_id = public.current_active_tutor_profile_id());

drop policy if exists "tutor_session_followups_update_tutor_owned" on public.tutor_session_followups;
create policy "tutor_session_followups_update_tutor_owned"
on public.tutor_session_followups
for update
to authenticated
using (tutor_profile_id = public.current_active_tutor_profile_id())
with check (tutor_profile_id = public.current_active_tutor_profile_id());

grant select, insert, update on public.notifications to authenticated;
grant select, insert, update on public.tutor_session_followups to authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text) from authenticated;

-- Phase 13: Outbound delivery and reminder-job foundation

alter table public.notifications
  add column if not exists related_entity_type text null
    check (
      related_entity_type is null
      or related_entity_type in ('tutor_session', 'tutor_session_followup')
    ),
  add column if not exists related_entity_id uuid null;

create index if not exists idx_notifications_related_entity
  on public.notifications(related_entity_type, related_entity_id);

drop function if exists public.insert_notification_record(uuid, text, text, text, text, text);

create or replace function public.insert_notification_record(
  target_user_id uuid,
  target_type text,
  target_title text,
  target_message text,
  target_link_url text,
  target_dedupe_key text default null,
  target_related_entity_type text default null,
  target_related_entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link_url,
    dedupe_key,
    related_entity_type,
    related_entity_id,
    is_read
  )
  values (
    target_user_id,
    target_type,
    target_title,
    target_message,
    target_link_url,
    target_dedupe_key,
    target_related_entity_type,
    target_related_entity_id,
    false
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null
    check (channel in ('email', 'sms', 'whatsapp')),
  template_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  external_message_id text null,
  error_message text null,
  sent_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null,
  related_entity_type text not null,
  related_entity_id uuid not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'processed', 'failed', 'canceled')),
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text null,
  processed_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notification_deliveries_user_created_at
  on public.notification_deliveries(user_id, created_at desc);
create index if not exists idx_notification_deliveries_user_status
  on public.notification_deliveries(user_id, status);
create unique index if not exists idx_notification_deliveries_notification_channel_template
  on public.notification_deliveries(notification_id, channel, template_key)
  where notification_id is not null;
create index if not exists idx_scheduled_jobs_user_status_scheduled_for
  on public.scheduled_jobs(user_id, status, scheduled_for);
create index if not exists idx_scheduled_jobs_related_entity
  on public.scheduled_jobs(related_entity_type, related_entity_id);
create unique index if not exists idx_scheduled_jobs_dedupe_key
  on public.scheduled_jobs(dedupe_key)
  where dedupe_key is not null;

create or replace function public.enqueue_notification_delivery_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if new.user_id is null then
    return new;
  end if;

  select email
  into target_email
  from auth.users
  where id = new.user_id;

  if target_email is null or length(trim(target_email)) = 0 then
    return new;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    user_id,
    channel,
    template_key,
    status
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending'
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;

-- Phase 21: richer watcher preferences and watcher-oriented execution

alter table public.operation_watchers
  add column if not exists is_muted boolean not null default false,
  add column if not exists notify_on_comment boolean not null default true,
  add column if not exists notify_on_owner_change boolean not null default true,
  add column if not exists notify_on_workflow_change boolean not null default true,
  add column if not exists notify_on_resolve boolean not null default true,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

drop trigger if exists trg_operation_watchers_updated_at on public.operation_watchers;
create trigger trg_operation_watchers_updated_at
before update on public.operation_watchers
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists "operation_watchers_update_own_admin" on public.operation_watchers;
create policy "operation_watchers_update_own_admin"
on public.operation_watchers
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

grant update on public.operation_watchers to authenticated;

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'watch_preferences_updated',
      'note_added'
    )
  );

create or replace function public.upsert_scheduled_job(
  target_user_id uuid,
  target_job_type text,
  target_related_entity_type text,
  target_related_entity_id uuid,
  target_scheduled_for timestamptz,
  target_payload jsonb default '{}'::jsonb,
  target_dedupe_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.scheduled_jobs (
    user_id,
    job_type,
    related_entity_type,
    related_entity_id,
    scheduled_for,
    status,
    payload,
    dedupe_key
  )
  values (
    target_user_id,
    target_job_type,
    target_related_entity_type,
    target_related_entity_id,
    target_scheduled_for,
    'pending',
    coalesce(target_payload, '{}'::jsonb),
    target_dedupe_key
  )
  on conflict (dedupe_key) do update
  set scheduled_for = excluded.scheduled_for,
    status = 'pending',
    payload = excluded.payload,
    processed_at = null,
    error_message = null
  where public.scheduled_jobs.status <> 'processed';
end;
$$;

create or replace function public.cancel_pending_jobs_for_entity(
  target_user_id uuid,
  target_related_entity_type text,
  target_related_entity_id uuid,
  target_job_prefix text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.scheduled_jobs
  set status = 'canceled',
    processed_at = timezone('utc', now()),
    error_message = 'Session is no longer eligible for this reminder.'
  where user_id = target_user_id
    and related_entity_type = target_related_entity_type
    and related_entity_id = target_related_entity_id
    and status = 'pending'
    and (
      target_job_prefix is null
      or job_type like target_job_prefix || '%'
    );
end;
$$;

create or replace function public.schedule_tutor_session_reminders(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  session_record public.tutor_sessions%rowtype;
  tutor_user_id uuid;
  reminder_24h_at timestamptz;
  reminder_soon_at timestamptz;
  now_utc timestamptz := timezone('utc', now());
begin
  select *
  into session_record
  from public.tutor_sessions
  where id = target_session_id;

  if not found then
    return;
  end if;

  select user_id
  into tutor_user_id
  from public.tutor_profiles
  where id = session_record.tutor_profile_id;

  if session_record.status <> 'confirmed'
    or session_record.scheduled_starts_at <= now_utc
    or session_record.scheduled_ends_at <= now_utc then
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_'
    );
    return;
  end if;

  reminder_24h_at := session_record.scheduled_starts_at - interval '24 hours';

  if reminder_24h_at > now_utc then
    perform public.upsert_scheduled_job(
      session_record.learner_user_id,
      'session_reminder_24h',
      'tutor_session',
      session_record.id,
      reminder_24h_at,
      jsonb_build_object('reminder_kind', '24h'),
      format('session-reminder-24h:%s:%s', session_record.id, session_record.learner_user_id)
    );

    if tutor_user_id is not null then
      perform public.upsert_scheduled_job(
        tutor_user_id,
        'session_reminder_24h',
        'tutor_session',
        session_record.id,
        reminder_24h_at,
        jsonb_build_object('reminder_kind', '24h'),
        format('session-reminder-24h:%s:%s', session_record.id, tutor_user_id)
      );
    end if;
  else
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_24h'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_24h'
    );
  end if;

  reminder_soon_at := greatest(
    now_utc + interval '1 minute',
    session_record.scheduled_starts_at - interval '1 hour'
  );

  if session_record.scheduled_starts_at > now_utc + interval '15 minutes' then
    perform public.upsert_scheduled_job(
      session_record.learner_user_id,
      'session_reminder_soon',
      'tutor_session',
      session_record.id,
      reminder_soon_at,
      jsonb_build_object('reminder_kind', 'soon'),
      format('session-reminder-soon:%s:%s', session_record.id, session_record.learner_user_id)
    );

    if tutor_user_id is not null then
      perform public.upsert_scheduled_job(
        tutor_user_id,
        'session_reminder_soon',
        'tutor_session',
        session_record.id,
        reminder_soon_at,
        jsonb_build_object('reminder_kind', 'soon'),
        format('session-reminder-soon:%s:%s', session_record.id, tutor_user_id)
      );
    end if;
  else
    if tutor_user_id is not null then
      perform public.cancel_pending_jobs_for_entity(
        tutor_user_id,
        'tutor_session',
        session_record.id,
        'session_reminder_soon'
      );
    end if;

    perform public.cancel_pending_jobs_for_entity(
      session_record.learner_user_id,
      'tutor_session',
      session_record.id,
      'session_reminder_soon'
    );
  end if;
end;
$$;

create or replace function public.handle_tutor_session_reminder_jobs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_id uuid := coalesce(new.id, old.id);
begin
  if tg_op = 'INSERT' then
    perform public.schedule_tutor_session_reminders(session_id);
    return new;
  end if;

  if old.status is distinct from new.status
    or old.scheduled_starts_at is distinct from new.scheduled_starts_at
    or old.scheduled_ends_at is distinct from new.scheduled_ends_at then
    perform public.schedule_tutor_session_reminders(session_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tutor_user_id uuid;
  session_label text;
  learner_canceled boolean;
begin
  select user_id
  into tutor_user_id
  from public.tutor_profiles
  where id = coalesce(new.tutor_profile_id, old.tutor_profile_id);

  session_label := coalesce(new.subject, old.subject, 'Tutor session');

  if tg_op = 'INSERT' then
    if tutor_user_id is not null then
      perform public.insert_notification_record(
        tutor_user_id,
        'session_booked',
        'New tutor session request',
        format('A learner booked "%s". Review the request in your tutor session queue.', session_label),
        '/tutor/sessions',
        format('session-booked:%s:%s', new.id, tutor_user_id),
        'tutor_session',
        new.id
      );
    end if;

    return new;
  end if;

  learner_canceled := auth.uid() = old.learner_user_id;

  if old.status is distinct from new.status then
    if new.status = 'confirmed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_confirmed',
        'Tutor session confirmed',
        format('Your session "%s" was confirmed by the tutor.', session_label),
        '/sessions',
        format('session-confirmed:%s:%s', new.id, new.learner_user_id),
        'tutor_session',
        new.id
      );
    elsif new.status = 'canceled' then
      if learner_canceled then
        if tutor_user_id is not null then
          perform public.insert_notification_record(
            tutor_user_id,
            'session_canceled',
            'Learner canceled a session',
            format('The learner canceled "%s".', session_label),
            '/tutor/sessions',
            format('session-canceled-learner:%s:%s', new.id, tutor_user_id),
            'tutor_session',
            new.id
          );
        end if;
      else
        perform public.insert_notification_record(
          new.learner_user_id,
          'session_canceled',
          'Tutor session canceled',
          format('Your tutor canceled "%s".', session_label),
          '/sessions',
          format('session-canceled-tutor:%s:%s', new.id, new.learner_user_id),
          'tutor_session',
          new.id
        );
      end if;
    elsif new.status = 'completed' then
      perform public.insert_notification_record(
        new.learner_user_id,
        'session_completed',
        'Tutor session completed',
        format('Your session "%s" has been marked completed.', session_label),
        '/sessions',
        format('session-completed:%s:%s', new.id, new.learner_user_id),
        'tutor_session',
        new.id
      );
    end if;
  end if;

  if old.meeting_link is distinct from new.meeting_link
    and new.meeting_link is not null
    and length(trim(new.meeting_link)) > 0 then
    perform public.insert_notification_record(
      new.learner_user_id,
      'session_confirmed',
      'Meeting link available',
      format('A meeting link was added for "%s".', session_label),
      '/sessions',
      format('meeting-link-added:%s:%s', new.id, new.learner_user_id),
      'tutor_session',
      new.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_tutor_session_followup_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_subject text;
begin
  select subject
  into session_subject
  from public.tutor_sessions
  where id = new.tutor_session_id;

  perform public.insert_notification_record(
    new.learner_user_id,
    'followup_added',
    'Tutor follow-up available',
    format('A tutor follow-up was added for "%s".', coalesce(session_subject, 'your session')),
    '/sessions',
    format('followup-added:%s:%s', new.tutor_session_id, new.learner_user_id),
    'tutor_session',
    new.tutor_session_id
  );

  return new;
end;
$$;

drop trigger if exists trg_notification_delivery_enqueue on public.notifications;
create trigger trg_notification_delivery_enqueue
after insert on public.notifications
for each row
execute function public.enqueue_notification_delivery_record();

drop trigger if exists trg_tutor_session_reminder_jobs on public.tutor_sessions;
create trigger trg_tutor_session_reminder_jobs
after insert or update on public.tutor_sessions
for each row
execute function public.handle_tutor_session_reminder_jobs();

alter table public.notification_deliveries enable row level security;
alter table public.scheduled_jobs enable row level security;

drop policy if exists "notification_deliveries_select_own" on public.notification_deliveries;
create policy "notification_deliveries_select_own"
on public.notification_deliveries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification_deliveries_update_own" on public.notification_deliveries;
create policy "notification_deliveries_update_own"
on public.notification_deliveries
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "scheduled_jobs_select_own" on public.scheduled_jobs;
create policy "scheduled_jobs_select_own"
on public.scheduled_jobs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "scheduled_jobs_update_own" on public.scheduled_jobs;
create policy "scheduled_jobs_update_own"
on public.scheduled_jobs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, update on public.notification_deliveries to authenticated;
grant select, update on public.scheduled_jobs to authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text, text, uuid) from authenticated;
revoke execute on function public.upsert_scheduled_job(uuid, text, text, uuid, timestamptz, jsonb, text) from authenticated;
revoke execute on function public.cancel_pending_jobs_for_entity(uuid, text, uuid, text) from authenticated;
revoke execute on function public.schedule_tutor_session_reminders(uuid) from authenticated;

-- Phase 14: Automation, retry/backoff, and notification preferences

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null
    check (channel in ('in_app', 'email')),
  notification_type text not null
    check (
      notification_type in (
        'session_booked',
        'session_confirmed',
        'session_canceled',
        'session_reminder',
        'session_completed',
        'followup_added'
      )
    ),
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, channel, notification_type)
);

create index if not exists idx_notification_preferences_user_channel
  on public.notification_preferences(user_id, channel);

alter table public.notification_deliveries
  add column if not exists retry_count integer not null default 0,
  add column if not exists max_retries integer not null default 3,
  add column if not exists last_attempted_at timestamptz null,
  add column if not exists next_attempt_at timestamptz not null default timezone('utc', now()),
  add column if not exists processing_token uuid null,
  add column if not exists processing_started_at timestamptz null;

alter table public.scheduled_jobs
  add column if not exists retry_count integer not null default 0,
  add column if not exists max_retries integer not null default 3,
  add column if not exists last_attempted_at timestamptz null,
  add column if not exists processing_token uuid null,
  add column if not exists processing_started_at timestamptz null;

create index if not exists idx_notification_deliveries_status_next_attempt
  on public.notification_deliveries(status, next_attempt_at);
create index if not exists idx_notification_deliveries_processing_started
  on public.notification_deliveries(processing_started_at);
create index if not exists idx_scheduled_jobs_processing_started
  on public.scheduled_jobs(processing_started_at);

update public.notification_deliveries
set next_attempt_at = coalesce(next_attempt_at, created_at)
where next_attempt_at is null;

create or replace function public.seed_default_notification_preferences(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  channels text[] := array['in_app', 'email'];
  notification_types text[] := array[
    'session_booked',
    'session_confirmed',
    'session_canceled',
    'session_reminder',
    'session_completed',
    'followup_added'
  ];
  current_channel text;
  current_notification_type text;
begin
  foreach current_channel in array channels loop
    foreach current_notification_type in array notification_types loop
      insert into public.notification_preferences (
        user_id,
        channel,
        notification_type,
        is_enabled
      )
      values (
        target_user_id,
        current_channel,
        current_notification_type,
        true
      )
      on conflict (user_id, channel, notification_type) do nothing;
    end loop;
  end loop;
end;
$$;

create or replace function public.handle_notification_preferences_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_notification_preferences(new.id);
  return new;
end;
$$;

create or replace function public.notification_channel_enabled(
  target_user_id uuid,
  target_channel text,
  target_notification_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select np.is_enabled
      from public.notification_preferences np
      where np.user_id = target_user_id
        and np.channel = target_channel
        and np.notification_type = target_notification_type
      limit 1
    ),
    true
  );
$$;

create or replace function public.enqueue_notification_delivery_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if new.user_id is null then
    return new;
  end if;

  if not public.notification_channel_enabled(new.user_id, 'email', new.type) then
    return new;
  end if;

  select email
  into target_email
  from auth.users
  where id = new.user_id;

  if target_email is null or length(trim(target_email)) = 0 then
    return new;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    user_id,
    channel,
    template_key,
    status,
    retry_count,
    max_retries,
    next_attempt_at
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending',
    0,
    3,
    timezone('utc', now())
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;

create or replace function public.claim_due_scheduled_jobs(
  target_user_id uuid default auth.uid(),
  target_limit integer default 25,
  stale_after_minutes integer default 10
)
returns table (
  id uuid,
  user_id uuid,
  job_type text,
  related_entity_type text,
  related_entity_id uuid,
  scheduled_for timestamptz,
  status text,
  payload jsonb,
  dedupe_key text,
  retry_count integer,
  max_retries integer,
  last_attempted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if target_user_id is null then
      target_user_id := auth.uid();
    elsif target_user_id <> auth.uid() then
      raise exception 'Authenticated users can only claim their own scheduled jobs.';
    end if;
  end if;

  return query
  with candidate as (
    select scheduled_jobs.id
    from public.scheduled_jobs
    where scheduled_jobs.status = 'pending'
      and scheduled_jobs.scheduled_for <= timezone('utc', now())
      and (
        target_user_id is null
        or scheduled_jobs.user_id = target_user_id
      )
      and (
        scheduled_jobs.processing_started_at is null
        or scheduled_jobs.processing_started_at <= timezone('utc', now()) - make_interval(mins => stale_after_minutes)
      )
    order by scheduled_jobs.scheduled_for asc, scheduled_jobs.created_at asc
    for update skip locked
    limit greatest(target_limit, 1)
  ),
  claimed as (
    update public.scheduled_jobs
    set processing_token = gen_random_uuid(),
      processing_started_at = timezone('utc', now()),
      last_attempted_at = timezone('utc', now())
    where public.scheduled_jobs.id in (select candidate.id from candidate)
    returning
      public.scheduled_jobs.id,
      public.scheduled_jobs.user_id,
      public.scheduled_jobs.job_type,
      public.scheduled_jobs.related_entity_type,
      public.scheduled_jobs.related_entity_id,
      public.scheduled_jobs.scheduled_for,
      public.scheduled_jobs.status,
      public.scheduled_jobs.payload,
      public.scheduled_jobs.dedupe_key,
      public.scheduled_jobs.retry_count,
      public.scheduled_jobs.max_retries,
      public.scheduled_jobs.last_attempted_at
  )
  select *
  from claimed;
end;
$$;

create or replace function public.claim_due_notification_deliveries(
  target_user_id uuid default auth.uid(),
  target_limit integer default 25,
  stale_after_minutes integer default 10
)
returns table (
  id uuid,
  notification_id uuid,
  user_id uuid,
  channel text,
  template_key text,
  status text,
  external_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz,
  retry_count integer,
  max_retries integer,
  last_attempted_at timestamptz,
  next_attempt_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if target_user_id is null then
      target_user_id := auth.uid();
    elsif target_user_id <> auth.uid() then
      raise exception 'Authenticated users can only claim their own notification deliveries.';
    end if;
  end if;

  return query
  with candidate as (
    select notification_deliveries.id
    from public.notification_deliveries
    where notification_deliveries.status = 'pending'
      and notification_deliveries.channel = 'email'
      and coalesce(notification_deliveries.next_attempt_at, notification_deliveries.created_at) <= timezone('utc', now())
      and (
        target_user_id is null
        or notification_deliveries.user_id = target_user_id
      )
      and (
        notification_deliveries.processing_started_at is null
        or notification_deliveries.processing_started_at <= timezone('utc', now()) - make_interval(mins => stale_after_minutes)
      )
    order by coalesce(notification_deliveries.next_attempt_at, notification_deliveries.created_at) asc,
      notification_deliveries.created_at asc
    for update skip locked
    limit greatest(target_limit, 1)
  ),
  claimed as (
    update public.notification_deliveries
    set processing_token = gen_random_uuid(),
      processing_started_at = timezone('utc', now()),
      last_attempted_at = timezone('utc', now())
    where public.notification_deliveries.id in (select candidate.id from candidate)
    returning
      public.notification_deliveries.id,
      public.notification_deliveries.notification_id,
      public.notification_deliveries.user_id,
      public.notification_deliveries.channel,
      public.notification_deliveries.template_key,
      public.notification_deliveries.status,
      public.notification_deliveries.external_message_id,
      public.notification_deliveries.error_message,
      public.notification_deliveries.sent_at,
      public.notification_deliveries.created_at,
      public.notification_deliveries.retry_count,
      public.notification_deliveries.max_retries,
      public.notification_deliveries.last_attempted_at,
      public.notification_deliveries.next_attempt_at
  )
  select *
  from claimed;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_notification_preferences_new_user on auth.users;
create trigger trg_notification_preferences_new_user
after insert on auth.users
for each row
execute function public.handle_notification_preferences_for_new_user();

do $$
declare
  existing_user_id uuid;
begin
  for existing_user_id in
    select id
    from auth.users
  loop
    perform public.seed_default_notification_preferences(existing_user_id);
  end loop;
end;
$$;

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
create policy "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
create policy "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
create policy "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;
grant execute on function public.notification_channel_enabled(uuid, text, text) to authenticated;
grant execute on function public.claim_due_scheduled_jobs(uuid, integer, integer) to authenticated;
grant execute on function public.claim_due_notification_deliveries(uuid, integer, integer) to authenticated;
revoke execute on function public.seed_default_notification_preferences(uuid) from authenticated;

-- Phase 15: queue operations refinement

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_status_check;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_status_valid;

alter table public.notification_deliveries
  add constraint notification_deliveries_status_valid
  check (status in ('pending', 'sent', 'failed', 'ignored'));

-- Phase 16: queue incident management

create table if not exists public.operation_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  note_body text not null
    check (char_length(trim(note_body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_notes_entity_created_at
  on public.operation_notes(entity_type, entity_id, created_at desc);

create table if not exists public.operation_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid references auth.users(id) on delete set null,
  event_type text not null
    check (
      event_type in (
        'retry_requested',
        'force_retry_requested',
        'ignored',
        'canceled',
        'replay_requested',
        'status_changed',
        'note_added'
      )
    ),
  event_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_audit_events_entity_created_at
  on public.operation_audit_events(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_audit_events_admin_created_at
  on public.operation_audit_events(admin_user_id, created_at desc);

drop trigger if exists trg_operation_notes_updated_at on public.operation_notes;
create trigger trg_operation_notes_updated_at
before update on public.operation_notes
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_notes enable row level security;
alter table public.operation_audit_events enable row level security;

drop policy if exists "operation_notes_select_admin" on public.operation_notes;
create policy "operation_notes_select_admin"
on public.operation_notes
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_notes_insert_admin" on public.operation_notes;
create policy "operation_notes_insert_admin"
on public.operation_notes
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "operation_audit_events_select_admin" on public.operation_audit_events;
create policy "operation_audit_events_select_admin"
on public.operation_audit_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_audit_events_insert_admin" on public.operation_audit_events;
create policy "operation_audit_events_insert_admin"
on public.operation_audit_events
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_notes to authenticated;
grant select, insert on public.operation_audit_events to authenticated;

-- Phase 17: bulk triage workflows and operator ownership

alter table public.notification_deliveries
  add column if not exists assigned_admin_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists handoff_note text;

alter table public.scheduled_jobs
  add column if not exists assigned_admin_user_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists handoff_note text;

create index if not exists idx_notification_deliveries_assigned_admin
  on public.notification_deliveries(assigned_admin_user_id, status, created_at desc);

create index if not exists idx_scheduled_jobs_assigned_admin
  on public.scheduled_jobs(assigned_admin_user_id, status, created_at desc);

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'note_added'
    )
  );

-- Phase 19: operator workflow ergonomics and collaboration

create table if not exists public.operation_saved_views (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  name text not null check (length(trim(name)) > 0),
  filters_json jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_saved_views_default_unique
  on public.operation_saved_views(admin_user_id, entity_type)
  where is_default = true;

create index if not exists idx_operation_saved_views_admin_entity_updated_at
  on public.operation_saved_views(admin_user_id, entity_type, updated_at desc);

create table if not exists public.operation_comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  comment_body text not null check (char_length(trim(comment_body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_comments_entity_created_at
  on public.operation_comments(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_comments_admin_created_at
  on public.operation_comments(admin_user_id, created_at desc);

drop trigger if exists trg_operation_saved_views_updated_at on public.operation_saved_views;
create trigger trg_operation_saved_views_updated_at
before update on public.operation_saved_views
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_operation_comments_updated_at on public.operation_comments;
create trigger trg_operation_comments_updated_at
before update on public.operation_comments
for each row
execute function public.set_updated_at_timestamp();

alter table public.operation_saved_views enable row level security;
alter table public.operation_comments enable row level security;

drop policy if exists "operation_saved_views_select_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_select_own_admin"
on public.operation_saved_views
for select
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_insert_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_insert_own_admin"
on public.operation_saved_views
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_update_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_update_own_admin"
on public.operation_saved_views
for update
to authenticated
using (public.is_admin() and admin_user_id = auth.uid())
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_saved_views_delete_own_admin" on public.operation_saved_views;
create policy "operation_saved_views_delete_own_admin"
on public.operation_saved_views
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_comments_select_admin" on public.operation_comments;
create policy "operation_comments_select_admin"
on public.operation_comments
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_comments_insert_admin" on public.operation_comments;
create policy "operation_comments_insert_admin"
on public.operation_comments
for insert
to authenticated
with check (public.is_admin());

grant select, insert, update, delete on public.operation_saved_views to authenticated;
grant select, insert on public.operation_comments to authenticated;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned'
    )
  );

-- Phase 18: operator coordination and workflow polish

alter table public.notification_deliveries
  add column if not exists workflow_state text not null default 'open'
    check (workflow_state in ('open', 'investigating', 'waiting', 'resolved')),
  add column if not exists workflow_state_updated_at timestamptz not null default timezone('utc', now());

alter table public.scheduled_jobs
  add column if not exists workflow_state text not null default 'open'
    check (workflow_state in ('open', 'investigating', 'waiting', 'resolved')),
  add column if not exists workflow_state_updated_at timestamptz not null default timezone('utc', now());

create index if not exists idx_notification_deliveries_workflow_state
  on public.notification_deliveries(workflow_state, assigned_admin_user_id, created_at desc);

create index if not exists idx_scheduled_jobs_workflow_state
  on public.scheduled_jobs(workflow_state, assigned_admin_user_id, created_at desc);

create table if not exists public.operation_assignment_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  previous_admin_user_id uuid references auth.users(id) on delete set null,
  new_admin_user_id uuid references auth.users(id) on delete set null,
  changed_by_admin_user_id uuid not null references auth.users(id) on delete restrict,
  handoff_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_operation_assignment_history_entity_created_at
  on public.operation_assignment_history(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_assignment_history_changed_by_created_at
  on public.operation_assignment_history(changed_by_admin_user_id, created_at desc);

alter table public.operation_assignment_history enable row level security;

drop policy if exists "operation_assignment_history_select_admin" on public.operation_assignment_history;
create policy "operation_assignment_history_select_admin"
on public.operation_assignment_history
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_assignment_history_insert_admin" on public.operation_assignment_history;
create policy "operation_assignment_history_insert_admin"
on public.operation_assignment_history
for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.operation_assignment_history to authenticated;

-- Phase 20: watch-state and higher-signal incident execution

create table if not exists public.operation_watchers (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('notification_delivery', 'scheduled_job')),
  entity_id uuid not null,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_operation_watchers_unique
  on public.operation_watchers(entity_type, entity_id, admin_user_id);

create index if not exists idx_operation_watchers_entity_created_at
  on public.operation_watchers(entity_type, entity_id, created_at desc);

create index if not exists idx_operation_watchers_admin_created_at
  on public.operation_watchers(admin_user_id, created_at desc);

alter table public.operation_watchers enable row level security;

drop policy if exists "operation_watchers_select_admin" on public.operation_watchers;
create policy "operation_watchers_select_admin"
on public.operation_watchers
for select
to authenticated
using (public.is_admin());

drop policy if exists "operation_watchers_insert_own_admin" on public.operation_watchers;
create policy "operation_watchers_insert_own_admin"
on public.operation_watchers
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "operation_watchers_delete_own_admin" on public.operation_watchers;
create policy "operation_watchers_delete_own_admin"
on public.operation_watchers
for delete
to authenticated
using (public.is_admin() and admin_user_id = auth.uid());

grant select, insert, delete on public.operation_watchers to authenticated;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'session_booked',
      'session_confirmed',
      'session_canceled',
      'session_reminder',
      'session_completed',
      'followup_added',
      'operator_mentioned',
      'operation_watch_update'
    )
  );

alter table public.operation_audit_events
  drop constraint if exists operation_audit_events_event_type_check;

alter table public.operation_audit_events
  add constraint operation_audit_events_event_type_check
  check (
    event_type in (
      'retry_requested',
      'force_retry_requested',
      'ignored',
      'canceled',
      'replay_requested',
      'claimed',
      'released',
      'reassigned',
      'bulk_claimed',
      'bulk_released',
      'bulk_reassigned',
      'status_changed',
      'workflow_state_changed',
      'comment_added',
      'watch_started',
      'watch_removed',
      'note_added'
    )
  );

create or replace function public.enqueue_notification_delivery_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if new.user_id is null then
    return new;
  end if;

  if new.type not in (
    'session_booked',
    'session_confirmed',
    'session_canceled',
    'session_reminder',
    'session_completed',
    'followup_added'
  ) then
    return new;
  end if;

  if not public.notification_channel_enabled(new.user_id, 'email', new.type) then
    return new;
  end if;

  select email
  into target_email
  from auth.users
  where id = new.user_id;

  if target_email is null or length(trim(target_email)) = 0 then
    return new;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    user_id,
    channel,
    template_key,
    status,
    retry_count,
    max_retries,
    next_attempt_at
  )
  values (
    new.id,
    new.user_id,
    'email',
    new.type,
    'pending',
    0,
    3,
    timezone('utc', now())
  )
  on conflict (notification_id, channel, template_key) do nothing;

  return new;
end;
$$;


-- Phase 2: Module 1 blueprint patch`r`n-- Source: supabase\\seeds\\20260319_ccna_network_fundamentals_topics_1_8_to_1_13.sql
delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'network-fundamentals'
    and course_id = (
      select id
      from public.courses
      where slug = 'ccna-200-301-preparation'
    )
)
and (
  slug in (
    'network-devices-and-their-roles',
    'lan-architectures',
    'interfaces-and-cables',
    'switch-interfaces-and-common-interface-problems',
    'private-ipv4-addressing',
    'ipv6-addressing-fundamentals',
    'ipv6-neighbor-discovery-and-address-types',
    'ipv6-anycast-multicast-and-modified-eui-64',
    'ipv6-neighbor-discovery-and-slaac',
    'configuring-and-verifying-ipv6-addresses',
    'verifying-ip-parameters-on-client-operating-systems',
    'wireless-fundamentals',
    'wifi-channels-and-ssid-basics',
    'wireless-security',
    'virtualization-and-cloud-fundamentals',
    'containers-fundamentals',
    'vrf-fundamentals',
    'ethernet-lan-switching-fundamentals',
    'ethernet-switching-forwarding-and-flooding',
    'analyzing-ethernet-switching-arp-and-ping'
  )
  or order_index in (1, 9, 11, 13, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36)
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url
from public.modules m
join (
  values
    (
      $$network-fundamentals$$,
      $$Network Devices and Their Roles$$,
      $$network-devices-and-their-roles$$,
      $$Understand the main job of routers, switches, endpoints, servers, firewalls, IPS tools, and PoE-supported devices in a simple network.$$,
      $$## Simple Explanation

A network is a group of connected devices that share information and services. Some devices create or receive data, and some devices help move that data to the right place. For the CCNA exam, you should know what each major network component does and why it matters.

## Key Concepts

- A network allows connected devices to communicate.
- A node is any device connected to the network.
- End hosts, also called endpoints, are the source or destination of data.
- A client requests a service, such as opening a website.
- A server provides a service, such as sending a web page back to the client.
- A switch connects devices inside the same LAN and forwards frames using MAC addresses.
- A router connects different networks and forwards packets using IP addresses.
- A firewall filters traffic according to security rules.
- A next-generation firewall adds deeper inspection and extra security features.

### 1.1.b Layer 2 and Layer 3 switches

- A Layer 2 switch forwards traffic based on MAC addresses.
- A Layer 3 switch can do Layer 2 switching and Layer 3 routing.
- Layer 3 switches are often used for inter-VLAN routing inside a campus network.
- Layer 2 switching keeps traffic inside the same broadcast domain unless a router or Layer 3 switch is used.

### 1.1.c IPS

- IPS stands for Intrusion Prevention System.
- An IPS inspects traffic for malicious patterns or suspicious behavior.
- An IPS can automatically block harmful traffic.
- Some next-generation firewalls include IPS features in the same platform.

### 1.1.h PoE

- PoE stands for Power over Ethernet.
- PoE lets an Ethernet cable carry both data and electrical power.
- PoE is commonly used for access points, IP phones, and cameras.
- PoE reduces the need for separate power adapters near the device.

## Important Points for the CCNA Exam

- Switches are mainly used for communication inside the same local network.
- Routers are used when traffic must move between different networks.
- Know the difference between Layer 2 switching and Layer 3 switching.
- Know that IPS tools are designed to detect and prevent malicious traffic.
- Remember that PoE supplies power to devices across the Ethernet cable.
- Firewalls are security devices, not just forwarding devices.

## Real World Example

In a branch office, employee laptops connect to a switch. The switch connects to a router, and the router connects the office to the internet. A next-generation firewall with IPS features can sit at the edge to filter and block attacks. The office access points may receive both data and power through PoE-enabled switch ports.

## Quick Review

- Endpoints create and receive data.
- Switches move traffic inside a LAN.
- Routers move traffic between networks.
- Layer 3 switches can also route between VLANs.
- IPS helps stop malicious traffic.
- PoE powers devices through Ethernet.

## Key Terms

- Network
- Node
- End host
- Endpoint
- Client
- Server
- Switch
- Layer 2 switch
- Layer 3 switch
- Router
- Firewall
- Next-generation firewall
- IPS
- PoE

## Mini Practice Questions

1. What is the main difference between a Layer 2 switch and a Layer 3 switch?
2. What is the purpose of an IPS?
3. What does PoE allow an Ethernet cable to deliver besides data?$$,
      1,
      15,
      'https://www.youtube.com/watch?v=H8W9oMNSuwo'
    ),
    (
      $$network-fundamentals$$,
      $$LAN Architectures$$,
      $$lan-architectures$$,
      $$Learn how campus, data center, SOHO, on-premises, and cloud designs are organized and why each architecture is used.$$,
      $$## Simple Explanation

LAN architectures describe how devices and switches are arranged inside a local network. Small networks often use one simple device, while larger campus and data center networks use structured designs to improve performance, growth, and reliability.

## Key Concepts

- A LAN connects devices in a limited area such as an office, school, or building.
- A two-tier architecture has an Access layer and a Distribution layer.
- The Access layer connects end devices.
- The Distribution layer collects traffic from access switches and connects toward other networks.
- A three-tier architecture adds a Core layer above the Distribution layer.
- The Core layer focuses on fast forwarding across the network.
- The Core layer should avoid CPU intensive tasks when possible.
- Spine-leaf architecture is mainly used in data centers.
- In spine-leaf, every leaf switch connects to every spine switch.
- Leaf switches do not connect directly to other leaf switches.
- Spine switches do not connect directly to other spine switches.
- Servers usually connect to leaf switches.
- SOHO means Small Office or Home Office.
- A SOHO router often combines routing, switching, firewall, and wireless functions.
- Star topology uses a central device.
- Full mesh means every device connects to every other device.
- Partial mesh means only some devices have multiple paths.
- North-South traffic moves into or out of the network.
- East-West traffic moves inside the network, often between internal devices.

### 1.2.f On-premises and cloud

- On-premises resources are located in equipment owned and managed by the organization.
- Cloud resources are hosted by a provider and reached across a network connection.
- Many businesses use both on-premises and cloud services at the same time.
- Choosing between on-premises and cloud depends on cost, control, scalability, and business needs.

## Important Points for the CCNA Exam

- Know the difference between two-tier and three-tier campus design.
- Know that the Core layer is focused on fast transport.
- Know the basic spine-leaf connection rules.
- Understand what a SOHO network usually looks like.
- Be able to identify star, full mesh, and partial mesh topologies.
- Know the meaning of North-South and East-West traffic.
- Know the basic difference between on-premises and cloud-hosted resources.

## Real World Example

A university campus may use a three-tier design. Student devices connect at the Access layer, building switches connect into the Distribution layer, and the Core layer moves traffic quickly between buildings and shared services. The university may keep identity systems on-premises but host email or learning apps in the cloud.

## Quick Review

- LAN architectures describe how local networks are built.
- Two-tier and three-tier designs are common in campus networks.
- Spine-leaf is mainly used in data centers.
- SOHO networks are small and usually use one multifunction device.
- On-premises systems are local, while cloud systems are provider-hosted.

## Key Terms

- LAN
- Access layer
- Distribution layer
- Core layer
- Spine-leaf
- SOHO
- Star topology
- Full mesh
- Partial mesh
- North-South traffic
- East-West traffic
- On-premises
- Cloud

## Mini Practice Questions

1. Which layer in a three-tier campus design is focused on fast forwarding?
2. In a spine-leaf design, does a leaf switch connect directly to another leaf switch?
3. What is the basic difference between on-premises and cloud resources?$$,
      9,
      14,
      'https://www.youtube.com/watch?v=PvyEcLhmNBk'
    ),
    (
      $$network-fundamentals$$,
      $$Interfaces and Cables$$,
      $$interfaces-and-cables$$,
      $$Compare copper, fiber, shared media, and point-to-point cabling concepts used in Ethernet networks.$$,
      $$## Simple Explanation

Devices need physical interfaces and cables to communicate over a wired network. For the CCNA exam, you should know the basic cable categories, when copper or fiber is used, and how modern Ethernet links differ from older shared-media networks.

## Key Concepts

- Ethernet standards define how wired devices communicate.
- UTP means Unshielded Twisted Pair.
- A UTP cable has 8 wires grouped into 4 twisted pairs.
- Copper Ethernet commonly uses an RJ45 connector.
- A straight-through cable is usually used between different device types.
- A crossover cable is usually used between similar device types.
- Auto MDI-X allows devices to adjust cable pair usage automatically.
- Fiber optic cabling uses light instead of electrical signals.
- Multimode fiber is usually cheaper and used for shorter distances.
- Single-mode fiber is usually more expensive and used for longer distances.
- SFP modules allow routers and switches to use fiber links.

### 1.3.d Ethernet shared media

- Shared media means multiple devices use the same communication path.
- Older Ethernet hub networks were shared-media networks.
- Shared media can lead to collisions because devices compete to send.
- Modern switched Ethernet reduces shared-media problems by giving devices dedicated switch ports.

### 1.3.e Point-to-point connections

- A point-to-point connection is a direct link between exactly two devices.
- Many modern Ethernet links are point-to-point links.
- Point-to-point links are also common in WAN environments.
- Point-to-point connections are easier to troubleshoot because only two endpoints use the link.

## Important Points for the CCNA Exam

- Know the difference between straight-through and crossover cables.
- Know that Auto MDI-X reduces the need to worry about manual cable selection.
- Know that copper Ethernet commonly uses RJ45.
- Know the difference between multimode and single-mode fiber.
- Know that shared media is associated with older Ethernet designs and collisions.
- Know that point-to-point means a direct link between only two devices.
- Know the purpose of an SFP module.

## Real World Example

A desktop PC connected to an office switch usually uses a copper Ethernet cable with RJ45 connectors. A long building-to-building link may use fiber and SFP modules because fiber handles distance better than copper. In contrast, an old hub-based network used shared media, while a modern switch-to-switch uplink is usually point-to-point.

## Quick Review

- Copper and fiber are the main cable categories.
- Straight-through is usually used for different device types.
- Crossover is usually used for similar device types.
- Shared media means multiple devices use the same path.
- Point-to-point means one direct link between two devices.
- Fiber is better for longer distance links.

## Key Terms

- Ethernet
- UTP
- RJ45
- Straight-through cable
- Crossover cable
- Auto MDI-X
- Fiber optic cable
- Multimode fiber
- Single-mode fiber
- SFP
- Shared media
- Point-to-point

## Mini Practice Questions

1. Which connector is commonly used with copper Ethernet cabling?
2. Which type of fiber is usually better for longer distances?
3. What is the difference between shared media and a point-to-point connection?$$,
      11,
      13,
      'https://www.youtube.com/watch?v=fi4MdM8Brp8'
    ),
    (
      $$network-fundamentals$$,
      $$Switch Interfaces and Common Interface Problems$$,
      $$switch-interfaces-and-common-interface-problems$$,
      $$Understand speed, duplex, collisions, and interface counters so you can identify common link problems quickly.$$,
      $$## Simple Explanation

Switch interfaces are the ports where network cables connect to a switch. These interfaces matter at both Layer 1 and Layer 2. Problems with speed, duplex, or negotiation can lead to poor performance and interface errors.

## Key Concepts

- Switch interfaces operate at Layer 1 and Layer 2.
- Interfaces can run at speeds such as 10 Mbps, 100 Mbps, and 1 Gbps.
- Half duplex means a device cannot send and receive at the same time.
- Full duplex means a device can send and receive at the same time.
- Autonegotiation allows devices to choose the best speed and duplex automatically.
- A duplex mismatch happens when each side uses a different duplex setting.
- Common interface issues include CRC errors, runts, giants, input errors, and output errors.
- show interfaces status gives a fast summary of switch ports.

### 1.4 Collisions

- A collision happens when two devices send at the same time on shared media.
- Collisions were common on older half-duplex Ethernet networks that used hubs.
- Full-duplex switched Ethernet normally avoids collisions.

### 1.4 Speed mismatch

- A speed mismatch happens when the two sides of a link do not operate at the same speed.
- A speed mismatch can prevent the link from coming up or can cause unstable performance.
- Speed settings and autonegotiation should be checked during troubleshooting.

## Important Points for the CCNA Exam

- Know the meaning of speed and duplex.
- Know why full duplex is preferred on modern Ethernet links.
- Understand what autonegotiation does.
- Know that a duplex mismatch can cause performance and error problems.
- Associate collisions with older half-duplex shared Ethernet.
- Know that speed mismatches can also cause link problems.
- Recognize common interface error terms such as CRC, runts, and giants.
- Know when to use show interfaces status.

## Real World Example

A user reports a slow connection even though the link light is on. The switch shows interface errors because one side of the link is using half duplex while the other side is using full duplex. In another case, the link may fail because one side is manually set to a different speed than the other.

## Quick Review

- Switch ports work at Layer 1 and Layer 2.
- Speed and duplex settings affect performance.
- Autonegotiation helps devices choose settings.
- Collisions are linked to half-duplex shared media.
- Duplex and speed mismatches can create errors and slowness.

## Key Terms

- Interface
- Speed
- Duplex
- Half duplex
- Full duplex
- Autonegotiation
- Duplex mismatch
- Speed mismatch
- Collision
- CRC errors
- Runts
- Giants

## Mini Practice Questions

1. What is a collision?
2. What problem occurs when two sides of a link use different duplex settings?
3. What happens when the two sides of a link do not use the same speed?$$,
      13,
      13,
      'https://www.youtube.com/watch?v=cCqluocfQe0'
    ),
    (
      $$network-fundamentals$$,
      $$Private IPv4 Addressing$$,
      $$private-ipv4-addressing$$,
      $$Learn the RFC 1918 private IPv4 ranges and why NAT is usually needed when private networks communicate with the internet.$$,
      $$## Simple Explanation

Private IPv4 addresses are used inside internal networks like homes, schools, and offices. They are not meant to be routed across the public internet. This lets many organizations reuse the same internal address ranges safely, while a router usually uses NAT to let those private devices reach the internet.

## Key Concepts

- Private IPv4 addresses are used inside internal networks.
- Private IPv4 addresses are defined by RFC 1918.
- The three private IPv4 ranges are 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.
- Private addresses are not publicly routable on the internet.
- Many different organizations can reuse the same private ranges.
- NAT is commonly used when private hosts need internet access.

## Important Points for the CCNA Exam

- Memorize the three RFC 1918 private IPv4 ranges.
- Know that private IPv4 addresses are not routed on the public internet.
- Understand that NAT commonly connects private networks to the internet.
- Be able to quickly identify whether an IPv4 address is private or public.

## Real World Example

A company may assign 192.168.10.0/24 to office PCs and printers. Those devices communicate internally with private addresses, but when users browse the internet, the company router translates those private addresses to a public IP address.

## Quick Review

- Private IPv4 addressing is for internal networks.
- RFC 1918 defines the private ranges.
- Private addresses are not routed on the public internet.
- NAT commonly connects private networks to the internet.

## Key Terms

- Private IPv4
- RFC 1918
- NAT
- Public IPv4
- Internal network
- Address conservation

## Mini Practice Questions

1. Which three IPv4 ranges are reserved for private addressing?
2. Can a private IPv4 address be routed directly across the public internet?
3. What technology is commonly used to let private IPv4 hosts access the internet?$$,
      21,
      11,
      'https://youtu.be/3ROdsfEUuhs'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Fundamentals and Format$$,
      $$ipv6-addressing-fundamentals$$,
      $$Build a strong beginner foundation for IPv6 by learning why it exists, how it is written, and how to read its hexadecimal format.$$,
      $$## Simple Explanation

IPv6 was created because the internet needed far more addresses than IPv4 could provide. An IPv6 address is much longer than an IPv4 address, but once you understand the pattern, it becomes easier to read. For the CCNA exam, you should know that IPv6 addresses are 128 bits long, written in hexadecimal, and separated into groups with colons.

## Key Concepts

- IPv6 was designed to help solve IPv4 address exhaustion.
- An IPv6 address is 128 bits long.
- IPv6 addresses are written in hexadecimal.
- Hexadecimal uses the numbers 0 through 9 and the letters A through F.
- IPv6 addresses are written as eight groups of four hexadecimal characters.
- The groups are separated by colons.
- Example: 2001:0db8:0000:0000:0000:ff00:0042:8329

## Important Points for the CCNA Exam

- Remember that IPv6 uses 128-bit addresses, not 32-bit addresses like IPv4.
- Be able to recognize hexadecimal notation in an IPv6 address.
- Know that IPv6 addresses are normally shown as eight groups separated by colons.
- Do not confuse the longer IPv6 format with subnet masks written in dotted decimal.

## Real World Example

An internet provider may give a business an IPv6 prefix so every department, device, and service can have its own globally unique address range without running out of space as quickly as with IPv4.

## Quick Review

- IPv6 was created because IPv4 does not have enough addresses for long-term growth.
- IPv6 addresses are 128 bits long.
- IPv6 uses hexadecimal instead of dotted decimal.
- An IPv6 address is written as eight groups separated by colons.

## Key Terms

- IPv6
- IPv4 exhaustion
- 128-bit address
- Hexadecimal
- Hextet
- Colon-separated notation

## Mini Practice Questions

1. How many bits are in an IPv6 address?
2. Which numbering system does IPv6 use?
3. How are the groups in an IPv6 address separated?$$,
      22,
      11,
      'https://youtu.be/ZNuXyOXae5U'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Compression and Address Types$$,
      $$ipv6-neighbor-discovery-and-address-types$$,
      $$Learn the IPv6 shortening rules and the major unicast address types you must recognize quickly for the CCNA exam.$$,
      $$## Simple Explanation

IPv6 addresses are long, so there are rules that make them easier to write. You can remove leading zeros in a group, and you can replace one continuous stretch of all-zero groups with double colons. You also need to know the main IPv6 unicast address types because the CCNA exam often asks what an address is used for based on its prefix.

## Key Concepts

- Leading zeros in a group can be removed.
- Example: 0db8 becomes db8.
- One continuous sequence of zero groups can be replaced with ::.
- The double-colon shortcut can be used only once in one written address.
- 1.9.a Global Unicast addresses are public IPv6 addresses.
- Global Unicast uses the 2000::/3 range.
- 1.9.a Unique Local addresses are private-style internal addresses.
- Unique Local uses the FD00::/7 range.
- 1.9.a Link Local addresses are used on the local segment only.
- Link Local uses the FE80::/10 range.

## Important Points for the CCNA Exam

- Be able to shorten an IPv6 address correctly.
- Remember that only one zero sequence can be replaced with :: in a written address.
- Be able to match 2000::/3, FD00::/7, and FE80::/10 to the correct address types.
- Know that Link Local addresses are not routed across the wider network.

## Real World Example

If a router interface has a Global Unicast address for normal routed traffic, it will still also use a Link Local address so it can talk to nearby devices like the next-hop router on the same link.

## Quick Review

- IPv6 shortening removes extra zeros.
- The :: shortcut is allowed only once per address.
- Global Unicast is used for public routing.
- Unique Local is used for internal addressing.
- Link Local is used only on the local network segment.

## Key Terms

- Address compression
- Leading zeros
- Double colon
- Global Unicast
- Unique Local
- Link Local
- Prefix

## Mini Practice Questions

1. What is the main rule about using :: in an IPv6 address?
2. Which IPv6 prefix identifies Link Local addresses?
3. Which IPv6 address type is most similar to private IPv4 addressing?$$,
      23,
      12,
      'https://youtu.be/BrTMMOXFhDU'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Anycast, Multicast, and Modified EUI-64$$,
      $$ipv6-anycast-multicast-and-modified-eui-64$$,
      $$Cover the missing IPv6 blueprint items by learning how anycast, multicast, and Modified EUI-64 work in simple exam-focused terms.$$,
      $$## Simple Explanation

IPv6 uses more than just normal unicast communication. Anycast allows the same address to exist on multiple devices so traffic reaches the nearest one. Multicast lets one sender communicate with a group of receivers. Modified EUI-64 is a method a device can use to build part of its IPv6 address automatically from its MAC address.

## Key Concepts

- 1.9.b Anycast uses the same IPv6 address on multiple devices.
- Anycast traffic is delivered to the nearest matching destination based on routing.
- 1.9.c Multicast means one sender communicates with multiple receivers.
- IPv6 uses multicast instead of broadcast for many control functions.
- Multicast addresses use the FF00::/8 range.
- 1.9.d Modified EUI-64 creates a 64-bit interface ID from a MAC address.
- Modified EUI-64 inserts FFFE into the middle of the MAC-based value.
- Modified EUI-64 also changes the seventh bit of the original MAC-derived value.

## Important Points for the CCNA Exam

- Know that anycast reaches the nearest device using a shared address.
- Know that IPv6 uses multicast and does not rely on broadcast like IPv4.
- Recognize FF00::/8 as the IPv6 multicast range.
- Understand the basic idea of Modified EUI-64 even if the exam does not ask for a full manual calculation.

## Real World Example

A company might place the same anycast address on several DNS servers so users automatically reach the closest one. At the same time, routers and hosts still use IPv6 multicast for local network operations such as neighbor discovery.

## Quick Review

- Anycast means one address on multiple devices.
- Multicast means one sender to many receivers.
- IPv6 uses multicast instead of broadcast.
- Modified EUI-64 can automatically build an interface ID from a MAC address.

## Key Terms

- Anycast
- Multicast
- FF00::/8
- Interface ID
- Modified EUI-64
- MAC address

## Mini Practice Questions

1. What is the main purpose of an IPv6 anycast address?
2. Which IPv6 address range is used for multicast?
3. What does Modified EUI-64 help a device create?$$,
      24,
      11,
      'https://youtu.be/rwkHfsWQwy8'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Neighbor Discovery and SLAAC$$,
      $$ipv6-neighbor-discovery-and-slaac$$,
      $$Understand how IPv6 devices discover neighbors, learn about routers, and build addresses automatically with SLAAC.$$,
      $$## Simple Explanation

IPv6 does not use ARP like IPv4. Instead, it uses Neighbor Discovery Protocol, or NDP, which works with ICMPv6 messages. NDP helps devices discover nearby neighbors and routers, and it also supports automatic addressing through SLAAC.

## Key Concepts

- NDP stands for Neighbor Discovery Protocol.
- NDP replaces ARP in IPv6 networks.
- NDP uses ICMPv6 messages.
- Neighbor Solicitation is used to ask for neighbor information.
- Neighbor Advertisement is used to answer with neighbor information.
- Routers send Router Advertisements on the local link.
- SLAAC stands for Stateless Address Auto Configuration.
- SLAAC lets a host build its own IPv6 address from router-provided information.

## Important Points for the CCNA Exam

- Know that IPv6 uses NDP instead of ARP.
- Know that Neighbor Solicitation and Neighbor Advertisement are key ICMPv6 messages.
- Understand the basic idea of Router Advertisements.
- Remember that SLAAC allows automatic IPv6 addressing without manual configuration on the host.

## Real World Example

When a laptop joins an IPv6-enabled office network, it can listen for a Router Advertisement, learn the network prefix, build its own IPv6 address, and then use NDP to find other nearby devices.

## Quick Review

- NDP replaces ARP in IPv6.
- ICMPv6 carries NDP messages.
- Neighbor Solicitation asks for information.
- Neighbor Advertisement replies with information.
- SLAAC helps hosts create IPv6 addresses automatically.

## Key Terms

- NDP
- ICMPv6
- Neighbor Solicitation
- Neighbor Advertisement
- Router Advertisement
- SLAAC
- Stateless Address Auto Configuration

## Mini Practice Questions

1. Which IPv6 protocol replaces ARP?
2. Which message is used to answer a Neighbor Solicitation?
3. What does SLAAC let a host do automatically?$$,
      25,
      11,
      'https://youtu.be/rwkHfsWQwy8'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv6 Addressing$$,
      $$configuring-and-verifying-ipv6-addresses$$,
      $$Practice the IOS commands and verification steps needed to configure IPv6 on router interfaces and confirm that it works.$$,
      $$## Simple Explanation

Routers need IPv6 addresses on their interfaces before they can send traffic between IPv6 networks. In Cisco IOS, IPv6 routing must also be turned on globally. After configuration, you should always verify the interface address, interface state, and connectivity.

## Key Concepts

- IPv6 routing is enabled with ipv6 unicast-routing.
- An interface can be configured with the ipv6 address command.
- An IPv6 interface can have both a Global Unicast address and a Link Local address.
- no shutdown may still be needed to bring a router interface up.
- show ipv6 interface brief is a useful verification command.
- ping can be used to verify IPv6 connectivity.

## Important Points for the CCNA Exam

- Memorize ipv6 unicast-routing as the command that enables IPv6 routing on a router.
- Be comfortable assigning an IPv6 address and prefix length to an interface.
- Remember that IPv6 interfaces often have more than one address type.
- Expect basic IPv6 configuration and verification tasks in labs and exam questions.

## Real World Example

An administrator enables ipv6 unicast-routing, configures 2001:db8:1:1::1/64 on a router interface, enables the interface, and checks show ipv6 interface brief before testing with ping to another IPv6 device.

## Quick Review

- Enable IPv6 routing first.
- Configure the IPv6 address on the correct interface.
- Bring the interface up if needed.
- Verify the address and interface status.
- Test connectivity after configuration.

## Key Terms

- ipv6 unicast-routing
- ipv6 address
- Global Unicast
- Link Local
- show ipv6 interface brief
- Prefix length

## Mini Practice Questions

1. Which command enables IPv6 routing on a Cisco router?
2. Which command is commonly used to verify IPv6 interface addressing quickly?
3. Can one IPv6 interface have both a Link Local and a Global Unicast address?$$,
      26,
      12,
      'https://youtu.be/WSBEVFANMmc'
    ),
    (
      $$network-fundamentals$$,
      $$Verifying IP Parameters on Client Operating Systems$$,
      $$verifying-ip-parameters-on-client-operating-systems$$,
      $$Check the most important client IP settings on Windows, macOS, and Linux so you can troubleshoot connectivity problems quickly.$$,
      $$## Simple Explanation

When a client cannot reach the network, the first step is to check its IP settings. A wrong IP address, subnet mask, default gateway, or DNS server can stop communication even if the cabling and switch port are fine. Different operating systems use different commands, but you are always checking the same basic information.

## Key Concepts

- Important parameters include the IP address, subnet mask, default gateway, and DNS server.
- Windows commonly uses ipconfig and ipconfig /all.
- macOS commonly uses ifconfig and networksetup.
- Linux commonly uses ip addr and ifconfig.
- ping tests whether another device can be reached.
- traceroute helps show where traffic stops along the path.

## Important Points for the CCNA Exam

- Know which commands are commonly associated with Windows, macOS, and Linux.
- Always check the local IP settings before assuming the network itself is broken.
- Remember that ping tests reachability.
- Remember that traceroute helps you find where a path problem is happening.

## Real World Example

A student can reach the local printer but cannot open websites. After checking ipconfig /all, the technician sees the PC has the correct IP address but the wrong default gateway. Once the gateway is corrected, access to remote networks returns.

## Quick Review

- Verify the local IP settings first.
- Check the IP address, mask, gateway, and DNS server.
- Use the right command for the operating system.
- Use ping for reachability tests.
- Use traceroute to see where traffic fails.

## Key Terms

- IP address
- Subnet mask
- Default gateway
- DNS server
- ipconfig
- ifconfig
- networksetup
- ip addr
- ping
- traceroute

## Mini Practice Questions

1. Which Windows command shows detailed IP settings?
2. Which Linux command is commonly used to view interface addressing?
3. What is traceroute mainly used for?$$,
      27,
      10,
      'https://www.youtube.com/@JeremysITLab/videos'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless Fundamentals$$,
      $$wireless-fundamentals$$,
      $$Learn the core Wi-Fi standards, service set terms, RF behavior, and controller concepts that matter most for the CCNA exam.$$,
      $$## Simple Explanation

Wireless networking lets devices communicate without a cable by using radio waves. For CCNA, you should know the major Wi-Fi standards, understand how radio behavior affects the signal, and recognize how access points and wireless controllers fit into a wireless LAN design.

## Key Concepts

- Wireless LANs use IEEE 802.11 standards.
- Wi-Fi 4 maps to 802.11n.
- Wi-Fi 5 maps to 802.11ac.
- Wi-Fi 6 maps to 802.11ax.
- Absorption weakens a wireless signal when material takes in the energy.
- Reflection happens when a signal bounces off a surface.
- Refraction happens when a signal changes direction as it passes through different material.
- Interference from other devices or networks can reduce wireless performance.
- BSS stands for Basic Service Set.
- ESS stands for Extended Service Set.
- A Wireless LAN Controller centrally manages access points.

## Important Points for the CCNA Exam

- Be able to match Wi-Fi generations to their 802.11 names.
- Know the basic meaning of absorption, reflection, refraction, and interference.
- Understand that a BSS is one access point and its clients.
- Understand that an ESS is multiple access points joined into one larger wireless network.
- Know the basic role of a WLC in enterprise wireless networks.

## Real World Example

In a school building, several access points may use the same network name so students can move from room to room without losing connectivity. Together, those APs form an ESS, while the controller helps manage them from one place.

## Quick Review

- Wi-Fi uses 802.11 standards.
- RF behavior affects wireless coverage and quality.
- BSS and ESS describe wireless service-set design.
- A WLC makes enterprise AP management easier.

## Key Terms

- 802.11
- Wi-Fi 4
- Wi-Fi 5
- Wi-Fi 6
- Absorption
- Reflection
- Refraction
- Interference
- BSS
- ESS
- WLC

## Mini Practice Questions

1. Which 802.11 standard is called Wi-Fi 6?
2. What is the difference between a BSS and an ESS?
3. What is the main job of a Wireless LAN Controller?$$,
      28,
      12,
      'https://youtu.be/zuYiktLqNYQ'
    ),
    (
      $$network-fundamentals$$,
      $$Wi-Fi Channels and SSID Basics$$,
      $$wifi-channels-and-ssid-basics$$,
      $$Add the missing wireless blueprint coverage by learning non-overlapping channels and the purpose of the SSID.$$,
      $$## Simple Explanation

Wireless networks work better when nearby access points use channels that do not interfere with each other. In the 2.4 GHz band, the most common non-overlapping channels are 1, 6, and 11. You also need to know what an SSID is, because it is the wireless network name clients see when choosing which network to join.

## Key Concepts

- 1.11.a Non-overlapping Wi-Fi channels help reduce interference between nearby APs.
- In 2.4 GHz Wi-Fi, channels 1, 6, and 11 are the common non-overlapping choices.
- Overlapping channels can cause interference and poor performance.
- 1.11.b SSID stands for Service Set Identifier.
- The SSID is the wireless network name shown to users.
- Multiple APs in the same WLAN often use the same SSID to support roaming.

## Important Points for the CCNA Exam

- Memorize channels 1, 6, and 11 for 2.4 GHz non-overlapping coverage.
- Know that overlapping channels increase interference.
- Know that SSID is simply the wireless network name.
- Understand that multiple access points can share one SSID in an enterprise WLAN.

## Real World Example

In an office with three nearby access points, an administrator may assign channels 1, 6, and 11 so the APs interfere less with each other. All three APs can still use the same SSID, such as CertPrep-Staff, so users move around the office without manually changing networks.

## Quick Review

- Non-overlapping channels reduce wireless interference.
- In 2.4 GHz Wi-Fi, the common non-overlapping channels are 1, 6, and 11.
- An SSID is the wireless network name.
- Multiple APs can share the same SSID.

## Key Terms

- Non-overlapping channel
- 2.4 GHz
- Channel 1
- Channel 6
- Channel 11
- SSID
- Service Set Identifier
- Roaming

## Mini Practice Questions

1. Which three channels are commonly used as non-overlapping channels in 2.4 GHz Wi-Fi?
2. What does SSID stand for?
3. Why do administrators avoid overlapping channels on nearby access points?$$,
      29,
      10,
      'https://youtu.be/zuYiktLqNYQ'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless Security$$,
      $$wireless-security$$,
      $$Understand the evolution of Wi-Fi security and the authentication and encryption terms most likely to appear on the CCNA exam.$$,
      $$## Simple Explanation

Wireless traffic moves through the air, so security is very important. Older wireless security methods are weak and should not be trusted, while newer methods provide much better protection. On the CCNA exam, you should know the order of the major security standards and the role of common authentication and encryption methods.

## Key Concepts

- WEP is old, weak, and obsolete.
- WPA improved security but was only an intermediate step.
- WPA2 became the long-time standard in many networks.
- WPA3 is the newest and strongest option among the common CCNA terms.
- Enterprise wireless networks often use 802.1X for authentication.
- EAP is commonly used with 802.1X.
- AES is a strong encryption method.
- CCMP is an encryption mode associated with WPA2 and modern wireless security.

## Important Points for the CCNA Exam

- Know the security progression: WEP, WPA, WPA2, WPA3.
- Remember that WEP is not considered secure.
- Know that enterprise authentication commonly uses 802.1X with EAP.
- Associate AES and CCMP with stronger wireless protection.

## Real World Example

A company may require employees to log in to the wireless network with their own username and password through 802.1X authentication, rather than sharing one simple passphrase with everyone in the office.

## Quick Review

- WEP is weak and outdated.
- WPA was an improvement, but WPA2 and WPA3 are stronger.
- Enterprise wireless often uses 802.1X and EAP.
- AES and CCMP are important security terms for the exam.

## Key Terms

- WEP
- WPA
- WPA2
- WPA3
- 802.1X
- EAP
- AES
- CCMP

## Mini Practice Questions

1. Which wireless security standard is considered obsolete and weak?
2. Which authentication framework is commonly used in enterprise Wi-Fi?
3. Which is generally stronger for modern wireless security: WEP or WPA3?$$,
      30,
      10,
      'https://youtu.be/wHXKo9So5y8'
    ),
    (
      $$network-fundamentals$$,
      $$Virtualization and Cloud Fundamentals$$,
      $$virtualization-and-cloud-fundamentals$$,
      $$Learn how virtualization works, how hypervisors are classified, and how the main cloud service and deployment models fit together.$$,
      $$## Simple Explanation

Virtualization lets one physical computer run multiple virtual machines. This helps companies use hardware more efficiently and makes it easier to deploy servers quickly. Cloud computing builds on these ideas by delivering computing resources as services instead of requiring every company to buy and manage all hardware itself.

## Key Concepts

- Virtualization allows multiple virtual machines to run on one physical server.
- A virtual machine has its own operating system and resources.
- A Type 1 hypervisor runs directly on the hardware.
- A Type 2 hypervisor runs on top of an existing operating system.
- Cloud computing follows service and deployment models.
- IaaS means Infrastructure as a Service.
- PaaS means Platform as a Service.
- SaaS means Software as a Service.
- Public cloud is shared provider infrastructure.
- Private cloud is built for one organization.
- Hybrid cloud combines more than one deployment model.

## Important Points for the CCNA Exam

- Know the difference between Type 1 and Type 2 hypervisors.
- Understand that virtualization improves hardware efficiency and flexibility.
- Be able to identify IaaS, PaaS, and SaaS.
- Be able to identify public, private, and hybrid cloud models.

## Real World Example

Instead of buying separate physical servers for email, file storage, and a web app, a company can run multiple virtual machines on one powerful server or move some of those services into the cloud.

## Quick Review

- Virtualization lets many virtual systems run on one physical system.
- Hypervisors manage virtual machines.
- Cloud services are commonly grouped as IaaS, PaaS, and SaaS.
- Cloud deployments can be public, private, or hybrid.

## Key Terms

- Virtualization
- Virtual machine
- Hypervisor
- Type 1
- Type 2
- IaaS
- PaaS
- SaaS
- Public cloud
- Private cloud
- Hybrid cloud

## Mini Practice Questions

1. What is the difference between a Type 1 and Type 2 hypervisor?
2. Which cloud model gives customers complete applications over the internet?
3. What does hybrid cloud mean?$$,
      31,
      12,
      'https://youtu.be/_S3greGajJA'
    ),
    (
      $$network-fundamentals$$,
      $$Containers Fundamentals$$,
      $$containers-fundamentals$$,
      $$See how containers differ from virtual machines and why technologies like Docker and Kubernetes matter in modern IT environments.$$,
      $$## Simple Explanation

Containers are a lightweight way to run applications. Unlike virtual machines, containers do not need a full separate operating system for each workload. They share the host operating system kernel, which makes them faster to start and more efficient to run.

## Key Concepts

- Containers package an application and its needed dependencies.
- Containers share the host operating system kernel.
- Containers are lighter than virtual machines.
- Containers usually start faster than virtual machines.
- Docker is a common container platform.
- Kubernetes is commonly used to manage many containers at scale.

## Important Points for the CCNA Exam

- Know that containers are lighter than virtual machines.
- Remember that containers share the host OS kernel.
- Know Docker as a container technology.
- Know Kubernetes as a container orchestration platform.

## Real World Example

A development team may package a web application inside a Docker container so it runs the same way on a laptop, a test server, and a production platform. If the company uses many containers, Kubernetes can help deploy and manage them.

## Quick Review

- Containers are lightweight application environments.
- They share the host OS kernel.
- Docker is used to create and run containers.
- Kubernetes helps manage containers at larger scale.

## Key Terms

- Container
- Host OS kernel
- Docker
- Kubernetes
- Orchestration
- Virtual machine

## Mini Practice Questions

1. Why are containers usually lighter than virtual machines?
2. Which platform is commonly used to run containers?
3. Which technology is commonly used to manage many containers together?$$,
      32,
      9,
      'https://youtu.be/K731pAS22Aw'
    ),
    (
      $$network-fundamentals$$,
      $$VRF Fundamentals$$,
      $$vrf-fundamentals$$,
      $$Understand how VRF lets one router keep separate routing tables so different groups can stay isolated from each other.$$,
      $$## Simple Explanation

VRF stands for Virtual Routing and Forwarding. It allows one router to keep multiple separate routing tables. This is useful when different departments, customers, or services need to stay isolated even though they share the same physical router.

## Key Concepts

- VRF stands for Virtual Routing and Forwarding.
- A VRF creates a separate routing table.
- Traffic in one VRF is isolated from traffic in another VRF unless extra configuration is added.
- VRF can separate departments, tenants, or customers on shared infrastructure.
- VRF improves logical separation without requiring a completely separate router for each group.

## Important Points for the CCNA Exam

- Know that VRF allows multiple routing tables on one router.
- Understand that VRF is used for traffic isolation.
- Be able to explain why VRF is useful in service provider and enterprise environments.

## Real World Example

An enterprise router may use one VRF for the finance department and another VRF for the engineering department so both groups can use the same router hardware while keeping their routing information separate.

## Quick Review

- VRF creates separate routing tables.
- VRF helps isolate traffic.
- One physical router can support multiple logical routing environments.

## Key Terms

- VRF
- Virtual Routing and Forwarding
- Routing table
- Traffic isolation
- Shared infrastructure

## Mini Practice Questions

1. What does VRF allow one router to keep multiple copies of?
2. Why do organizations use VRF?
3. Does VRF separate traffic logically or physically?$$,
      33,
      9,
      'https://youtu.be/Ge4644KUvh4'
    ),
    (
      $$network-fundamentals$$,
      $$Ethernet LAN Switching Fundamentals$$,
      $$ethernet-lan-switching-fundamentals$$,
      $$Build a beginner-friendly understanding of Ethernet frames, MAC addresses, MAC aging, and how switches learn where devices are connected.$$,
      $$## Simple Explanation

Switches move traffic inside a LAN by looking at MAC addresses. To do that, they read information inside Ethernet frames and keep track of which devices are connected to which switch ports. Once you understand frames, MAC learning, and MAC aging, the rest of switching becomes much easier.

## Key Concepts

- Ethernet frames carry data across a LAN.
- An Ethernet frame includes a preamble, destination MAC address, source MAC address, Type or Length field, payload, and Frame Check Sequence.
- The source MAC address shows who sent the frame.
- The destination MAC address shows who should receive the frame.
- The FCS helps detect errors in the frame.
- A switch learns MAC addresses from the source MAC address of incoming frames.
- Learned MAC addresses are stored in the MAC address table, also called the CAM table.

### 1.13.a MAC learning and aging

- Dynamic MAC entries do not stay in the table forever.
- If a device is inactive long enough, the switch ages out the MAC entry.
- MAC aging helps keep the table accurate if a device moves to another port.
- If the switch needs the address again later, it relearns it from new incoming traffic.

## Important Points for the CCNA Exam

- Be able to name the main Ethernet frame fields at a basic level.
- Know that switches learn from the source MAC address, not the destination MAC address.
- Know that dynamic MAC entries age out after inactivity.
- Know that the MAC address table and CAM table refer to the same idea in many CCNA explanations.
- Understand that switching is a Layer 2 process based on MAC addresses.

## Real World Example

When a PC sends a frame to a printer, the switch records the PC's MAC address on the incoming port. If that PC is disconnected for a long time, the switch can age out the entry. When the PC sends traffic again later, the switch relearns the MAC address on the correct port.

## Quick Review

- Ethernet frames carry LAN traffic.
- MAC addresses identify sending and receiving devices on the LAN.
- Switches learn source MAC addresses.
- The MAC address table stores what the switch has learned.
- Dynamic entries age out if they are inactive long enough.

## Key Terms

- Ethernet frame
- Preamble
- Source MAC address
- Destination MAC address
- Type field
- Payload
- FCS
- MAC learning
- MAC aging
- MAC address table
- CAM table

## Mini Practice Questions

1. Which part of the Ethernet frame does a switch use to learn a new device location?
2. What is another common name for the MAC address table?
3. Why does a switch age out dynamic MAC entries?$$,
      34,
      12,
      'https://youtu.be/u2n762WG0Vo'
    ),
    (
      $$network-fundamentals$$,
      $$Ethernet Switching Forwarding and Flooding$$,
      $$ethernet-switching-forwarding-and-flooding$$,
      $$Learn the basic switch decision process so you can explain when a frame is forwarded normally and when it is flooded.$$,
      $$## Simple Explanation

After a switch learns the source MAC address of an incoming frame, it checks its MAC address table for the destination MAC address. If the destination is known, the frame is forwarded only out the correct port. If the destination is unknown, the switch floods the frame out other ports in the VLAN so the frame can still reach its target.

## Key Concepts

- Step 1: learn the source MAC address on the incoming port.
- Step 2: check the MAC address table for the destination MAC address.
- Step 3: forward the frame if the destination is known.
- Step 4: flood the frame if the destination is unknown.
- Unknown unicast traffic is flooded.
- Broadcast traffic is also flooded within the VLAN.
- Switching decisions are based on Layer 2 information.

## Important Points for the CCNA Exam

- Memorize the basic switch learning process.
- Know why a switch floods unknown destination traffic.
- Understand that flooding happens so the switch can still deliver a frame when it has not learned the destination yet.
- Remember that flooding stays inside the Layer 2 broadcast domain.

## Real World Example

If a switch has never seen a server's MAC address before, the first frame sent to that server is flooded. When the server replies, the switch learns the server's MAC address and can forward later frames directly.

## Quick Review

- Switches learn first, then look up the destination.
- Known destinations are forwarded.
- Unknown destinations are flooded.
- Flooding helps initial communication succeed inside the LAN.

## Key Terms

- Forwarding
- Flooding
- Unknown unicast
- Broadcast
- MAC lookup
- Layer 2

## Mini Practice Questions

1. What does a switch do if the destination MAC address is not in its table?
2. Which address does the switch learn first from an incoming frame?
3. Are switching forwarding decisions based on MAC addresses or IP addresses?$$,
      35,
      11,
      'https://youtu.be/5q1pqdmdPjo'
    ),
    (
      $$network-fundamentals$$,
      $$Analyzing Ethernet Switching, ARP, and Ping$$,
      $$analyzing-ethernet-switching-arp-and-ping$$,
      $$Tie the main switching ideas together by following what happens when hosts use ARP and ping to communicate across a LAN.$$,
      $$## Simple Explanation

When one device wants to ping another device on the same LAN, it may first need to learn the destination MAC address with ARP. The switch helps move the ARP messages and later the ping traffic by learning MAC addresses and forwarding frames to the correct ports. This gives you a full picture of how Layer 2 switching supports Layer 3 communication.

## Key Concepts

- ARP maps an IPv4 address to a MAC address.
- An ARP request is broadcast on the local network.
- The ARP reply is usually unicast back to the requester.
- ping uses ICMP to test connectivity.
- A successful ping often depends on correct addressing and successful ARP resolution first.
- Switches learn MAC addresses while forwarding ARP and ping traffic.

## Important Points for the CCNA Exam

- Know that ARP is used to learn the destination MAC address for IPv4 communication on a LAN.
- Know that ping uses ICMP.
- Be able to describe the order of events at a basic level: ARP first, then data forwarding.
- Understand how switch learning appears during normal host communication.

## Real World Example

A PC wants to ping another PC on the same subnet. It first sends an ARP request asking who owns the target IP address. The switch floods that ARP request. The target PC replies with its MAC address, the switch learns more MAC entries, and then the original PC can send the ICMP echo request.

## Quick Review

- ARP finds the MAC address tied to an IPv4 address.
- ARP requests are broadcast.
- ping uses ICMP to test connectivity.
- Switches support the whole process by learning and forwarding frames.

## Key Terms

- ARP
- ARP request
- ARP reply
- ICMP
- ping
- Echo request
- Echo reply

## Mini Practice Questions

1. What protocol maps an IPv4 address to a MAC address?
2. Is an ARP request normally broadcast or unicast?
3. Which protocol does ping use?$$,
      36,
      11,
      'https://youtu.be/Ig0dSaOQDI8'
    )
) as l(module_slug, title, slug, summary, content, order_index, estimated_minutes, video_url)
  on l.module_slug = m.slug
where m.course_id = (
  select id
  from public.courses
  where slug = 'ccna-200-301-preparation'
)
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url;





-- ==============================
-- Module 2: Network Access full curriculum

update public.modules
set
  title = 'Network Access',
  description = 'VLANs, trunks, switching protocols, wireless access design, management access, and QoS concepts for CCNA.',
  order_index = 2,
  is_published = true
where slug = 'network-access'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'network-access'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$2.1 VLAN Fundamentals$$,$$vlan-fundamentals$$,$$Understand VLANs, VLAN IDs, and broadcast-domain separation.$$,$$## Simple Explanation

A VLAN, or Virtual LAN, is a logical group of switch ports that forms its own Layer 2 network. Even if many devices plug into the same physical switch, the switch can keep them separated by putting them into different VLANs. This means their broadcasts stay separate, their traffic is easier to organize, and the network becomes easier to manage as it grows.

For the CCNA, the big idea is that VLANs create separate broadcast domains on the same switching hardware. They do not replace routing, but they make segmentation possible. Once you understand VLANs clearly, trunking, inter-VLAN routing, voice VLANs, and many campus troubleshooting questions become much easier.

## Key Concepts

- VLAN stands for Virtual LAN.
- A VLAN creates a separate Layer 2 broadcast domain.
- One physical switch can support many VLANs at the same time.
- Devices in the same VLAN can communicate through switching if their addressing also fits.
- Devices in different VLANs need Layer 3 routing to communicate.
- Normal-range VLANs are numbered 1 through 1005.
- VLAN 1 exists by default on Cisco switches.
- VLANs are commonly used to separate user traffic, voice traffic, guest traffic, and management traffic.

## Important Points for the CCNA Exam

- Know that VLANs are a Layer 2 segmentation tool.
- Remember that broadcast traffic stays inside its VLAN unless routing is involved.
- Be able to identify why different departments or services are often placed into different VLANs.
- Know that a switchport must be assigned to the correct VLAN for the connected device to be in the right Layer 2 network.
- Expect simple exam questions that connect VLANs to access ports, trunks, and inter-VLAN communication.

## Real World Example

Imagine a company with an accounting team, a sales team, and IP phones across the office. The switch may place accounting users in VLAN 10, sales users in VLAN 20, and phones in VLAN 30. All of those devices can still plug into the same family of switches, but their traffic stays separated. That makes it easier to control broadcasts, apply policy later, and troubleshoot issues by department or function.

## Quick Review

- VLANs separate Layer 2 traffic on a switch.
- Each VLAN is its own broadcast domain.
- One switch can support many VLANs.
- Different VLANs need routing to communicate.
- VLANs are one of the main building blocks of campus network design.

## Key Terms

- VLAN
- Virtual LAN
- Broadcast domain
- VLAN ID
- Layer 2 segmentation
- Inter-VLAN routing

## Mini Practice Questions

1. What does a VLAN create on a switch?
2. Can hosts in different VLANs communicate without Layer 3 routing?
3. Why do enterprise networks often place users, phones, and management traffic into different VLANs?$$,1,11,'https://youtu.be/cjFzOnm6u1g'),
    ($$2.1 VLAN Configuration and Verification$$,$$vlan-configuration-and-verification$$,$$Create VLANs, assign access ports, and verify the result with common show commands.$$,$$## Simple Explanation

After creating a VLAN, you must place the right interfaces into it. Verification matters because a device can be connected physically but still sit in the wrong VLAN.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Create the VLAN first.
- Use access mode for end-device ports.
- Verify with `show vlan brief`.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Know the difference between creating a VLAN and assigning a port.
- Expect troubleshooting based on wrong VLAN membership.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A finance PC may fail because its port is still in VLAN 1 instead of VLAN 30. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Create.
- Assign.
- Verify.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Access port
- VLAN membership
- `show vlan brief`

## Mini Practice Questions

1. Which command commonly shows VLAN membership?
2. Can a port be up but in the wrong VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,2,12,'https://youtu.be/-tq7f3xtyLQ'),
    ($$2.1 Voice VLAN and Access Ports$$,$$voice-vlan-and-access-ports$$,$$Learn how one switch port can support a data VLAN for a PC and a voice VLAN for an IP phone.$$,$$## Simple Explanation

Many business switch ports carry normal user traffic for a PC and separate voice traffic for an IP phone. This keeps voice easier to manage and protect.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Access ports serve end devices.
- Voice VLANs separate phone traffic from PC traffic.
- One physical port can support both roles.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- The PC normally uses the access VLAN.
- The phone uses the voice VLAN.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A desk phone connects to the switch, and the user PC connects through the phone. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Access VLAN for data.
- Voice VLAN for phones.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Voice VLAN
- Access VLAN
- IP phone

## Mini Practice Questions

1. Which device commonly uses a voice VLAN?
2. Does the PC behind the phone use the voice VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,3,10,'https://youtu.be/kGX76QNIjsE'),
    ($$2.1 VLANs Across Multiple Switches$$,$$vlans-across-multiple-switches$$,$$Explain how the same VLAN can exist on several switches by using trunks.$$,$$## Simple Explanation

If VLAN 10 exists on several switches, the links between those switches must carry VLAN 10 traffic. That is why interswitch trunks matter.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- VLANs can span many switches.
- Trunks carry multiple VLANs.
- 802.1Q tags frames on trunks.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Access links carry one VLAN.
- Trunks let same-VLAN users stay in one Layer 2 domain across switches.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

Sales users on two floors can stay in VLAN 10 across several access switches. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Same VLAN can exist on many switches.
- Trunks carry it across uplinks.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Trunk
- 802.1Q
- Tagged frame

## Mini Practice Questions

1. Why is a trunk needed between switches?
2. What standard tags VLAN traffic on a trunk?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,4,11,'https://youtu.be/Jl9OOzNaBDU'),
    ($$2.1 VLAN Practice Lab$$,$$vlan-practice-lab$$,$$Lab-style practice for VLAN creation, access ports, and verification.$$,$$## Simple Explanation

This lesson combines VLAN setup and verification so you can practice the workflow the CCNA expects: create, assign, test, and fix mistakes.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Build VLANs first.
- Assign interfaces carefully.
- Verify before troubleshooting higher layers.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Small VLAN mistakes cause common campus issues.
- Show commands are just as important as config commands.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A printer may be unreachable because its switchport was left in the default VLAN. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Create VLANs.
- Assign ports.
- Verify output.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- VLAN table
- Verification
- Access mode

## Mini Practice Questions

1. Why should you verify VLAN membership after configuration?
2. What happens if a host port is in the wrong VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,5,14,'https://youtu.be/iRkFE_lpYgc')
    ,
    ($$2.2 Trunking Fundamentals$$,$$trunking-fundamentals$$,$$Explain why trunk links are needed and how they differ from access ports.$$,$$## Simple Explanation

An access port usually connects to one end device and carries one main data VLAN. A trunk link usually connects network devices such as switches and carries traffic for many VLANs at the same time. Trunking is what allows VLANs to extend across a campus instead of being trapped on one switch.

For the CCNA, the important idea is that access links and trunk links serve different jobs. Access ports are for endpoints. Trunks are for carrying multiple VLANs between devices. If the trunk is not configured correctly, users in one VLAN may work while another VLAN fails, which is why trunk troubleshooting is so common.

## Key Concepts

- Access ports normally carry one VLAN for an endpoint.
- Trunk links carry multiple VLANs between network devices.
- 802.1Q is the common VLAN tagging method you need to know for the CCNA.
- Tagged frames let the receiving device know which VLAN the traffic belongs to.
- The native VLAN is commonly sent untagged.
- Trunks are often used between switches and between switches and Layer 3 devices.
- A trunk can carry user, voice, and management VLANs over one physical interface.

## Important Points for the CCNA Exam

- Know the difference between an access port and a trunk port.
- Understand why a multi-switch VLAN design depends on trunking.
- Be able to explain the basic role of 802.1Q tagging.
- Remember that native VLAN mismatches and allowed VLAN problems are common exam troubleshooting points.
- Expect questions where the trunk is physically up but logically wrong.

## Real World Example

Suppose a school has one access switch on each floor and several VLANs for students, teachers, and phones. The uplinks between those switches must be trunks. Without trunking, each uplink would only carry one VLAN, which would be inefficient and difficult to scale. With trunking, one physical uplink can carry all the needed VLANs together.

## Quick Review

- Access ports usually carry one VLAN.
- Trunks carry many VLANs.
- 802.1Q tags traffic on trunks.
- Native VLAN traffic is commonly untagged.
- A trunk problem may affect only some VLANs, not always all traffic.

## Key Terms

- Trunk port
- Access port
- 802.1Q
- Native VLAN
- Tagged frame
- Allowed VLAN list

## Mini Practice Questions

1. What is the main job of a trunk link?
2. What is the main difference between an access port and a trunk port?
3. Why can a trunk problem affect only some users or services instead of the entire link?$$,6,10,'https://youtu.be/OkPB028l2eE'),
    ($$2.2 DTP and VTP Overview$$,$$dtp-and-vtp-overview$$,$$Introduce DTP and VTP at a safe CCNA level, including why automatic behavior can be risky.$$,$$## Simple Explanation

DTP helps Cisco switches negotiate trunking, and VTP shares VLAN information between switches. Both are useful to understand, but both can cause problems if used carelessly.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- DTP negotiates trunks.
- VTP distributes VLAN information.
- Both are Cisco-focused topics.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- DTP is Cisco proprietary.
- Many engineers prefer manual trunk configuration.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

An unintended trunk can form if a switch port is left in a dynamic mode. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- DTP = trunk negotiation.
- VTP = VLAN advertisement.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- DTP
- VTP
- Dynamic trunking

## Mini Practice Questions

1. What does DTP do?
2. Why can VTP be risky in production?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,7,10,'https://youtu.be/JtQV_0Sjszg'),
    ($$2.2 Configure and Verify Trunk Links$$,$$configure-and-verify-trunk-links$$,$$Configure 802.1Q trunks, allowed VLANs, and native VLAN settings, then verify them.$$,$$## Simple Explanation

Configuring a trunk means allowing an interface to carry many VLANs. After that, you may limit which VLANs cross the link and check whether both ends match.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- Use trunk mode on interswitch links.
- Allowed VLAN lists control what crosses the link.
- Native VLAN should match on both ends.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- `show interfaces trunk` is a key verification command.
- Native VLAN mismatches are common problems.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

Only one department fails because its VLAN was removed from the allowed list. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- Configure.
- Match settings.
- Verify.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- Allowed VLAN
- Native VLAN
- `show interfaces trunk`

## Mini Practice Questions

1. What command commonly verifies trunks?
2. What happens if the native VLAN does not match?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,8,12,'https://youtu.be/MQcCr3QW1vE'),
    ($$2.2 Trunking Lab$$,$$trunking-lab$$,$$Lab-style practice for building and checking a trunk between switches.$$,$$## Simple Explanation

This lesson focuses on the practical side of trunking: build the link, verify the VLANs, and identify the setting that breaks traffic when something is wrong.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- Check both ends of the trunk.
- Verify allowed VLANs.
- Confirm native VLAN behavior.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- A trunk can be up and still be wrong.
- Lab questions often mix VLAN and trunk troubleshooting.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

Phones fail on one floor because the voice VLAN is missing on the trunk. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- Build trunk.
- Verify traffic.
- Troubleshoot mismatch.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- Trunk mismatch
- Voice VLAN
- Verification

## Mini Practice Questions

1. Can a trunk be up while some VLANs fail?
2. Why should both sides of the link be checked?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,9,13,'https://youtu.be/ngTns2vF_44'),
    ($$2.3 CDP and LLDP Fundamentals$$,$$cdp-and-lldp-fundamentals$$,$$Compare Cisco Discovery Protocol with the open-standard LLDP.$$,$$## Simple Explanation

CDP and LLDP help devices learn about directly connected neighbors. CDP is Cisco proprietary, while LLDP works across vendors.

For the CCNA, treat CDP and LLDP as practical troubleshooting tools that help confirm what is connected on the other side of a link.

## Key Concepts

- Both are Layer 2 discovery protocols.
- Both discover directly connected neighbors.
- LLDP is vendor neutral.
- Discovery protocols are useful during installation, topology checks, and troubleshooting.
- They help confirm both device identity and interface relationships.

## Important Points for the CCNA Exam

- Know the Cisco vs open-standard difference.
- Expect neighbor-table interpretation.
- You may be asked to identify whether CDP or LLDP is the better choice in a mixed-vendor environment.
- Neighbor discovery is often part of verifying the physical and data-link layers.

## Real World Example

An engineer can identify the remote switch and interface without tracing the cable manually. In practice, discovery output can save time when diagrams are outdated or cable labels are unclear.

## Quick Review

- CDP and LLDP discover neighbors.
- LLDP is open standard.
- Discovery protocols are about directly connected devices.
- They are verification tools as much as learning topics.

## Key Terms

- CDP
- LLDP
- Neighbor

## Mini Practice Questions

1. Which protocol is vendor neutral?
2. Do these protocols discover distant or directly connected devices?
3. Why are CDP and LLDP especially useful when a topology diagram is incomplete or outdated?$$,10,9,'https://youtu.be/_hnMZBzXRRk')
    ,
    ($$2.3 Configure and Verify CDP and LLDP$$,$$configure-and-verify-cdp-and-lldp$$,$$Use common commands to view, enable, disable, and verify CDP and LLDP.$$,$$## Simple Explanation

This lesson is about operational use. You need to know how to check neighbor details and when it makes sense to disable discovery on certain interfaces.

For the CCNA, treat CDP and LLDP as practical troubleshooting tools that help confirm what is connected on the other side of a link.

## Key Concepts

- `show cdp neighbors`
- `show lldp neighbors`
- Discovery can be managed intentionally.
- Discovery protocols are useful during installation, topology checks, and troubleshooting.
- They help confirm both device identity and interface relationships.

## Important Points for the CCNA Exam

- Verification commands matter.
- Discovery may be disabled for policy or security reasons.
- You may be asked to identify whether CDP or LLDP is the better choice in a mixed-vendor environment.
- Neighbor discovery is often part of verifying the physical and data-link layers.

## Real World Example

CDP may stay enabled internally but be turned off on external-facing links. In practice, discovery output can save time when diagrams are outdated or cable labels are unclear.

## Quick Review

- Use show commands.
- Manage discovery intentionally.
- Discovery protocols are about directly connected devices.
- They are verification tools as much as learning topics.

## Key Terms

- Neighbor table
- Verification
- Interface control

## Mini Practice Questions

1. Which command shows CDP neighbors?
2. Why might discovery be disabled on some interfaces?
3. Why are CDP and LLDP especially useful when a topology diagram is incomplete or outdated?$$,11,10,'https://youtu.be/4s8qqL7R9W8'),
    ($$2.4 EtherChannel Fundamentals$$,$$etherchannel-fundamentals$$,$$Learn why EtherChannel is used and how LACP differs from PAgP.$$,$$## Simple Explanation

EtherChannel lets several physical interfaces work together as one logical link. This gives a network more available bandwidth and better redundancy without making Spanning Tree block every extra path. Instead of treating each cable as a separate connection, the switch treats the bundled group as one logical interface called a port-channel.

For the CCNA, the most important ideas are why EtherChannel exists, why matching member-link settings matter, and how LACP compares with PAgP. If you understand those ideas clearly, later Layer 2 and Layer 3 EtherChannel lessons become much easier.

## Key Concepts

- EtherChannel bundles multiple physical interfaces into one logical link.
- The logical interface is commonly called a port-channel.
- EtherChannel improves bandwidth because multiple links can be used together.
- EtherChannel improves redundancy because the bundle can keep working if one member link fails.
- Spanning Tree treats the bundle as one logical path.
- LACP is the open-standard negotiation protocol for EtherChannel.
- PAgP is Cisco proprietary.
- Member links must have matching settings to join the same EtherChannel.

## Important Points for the CCNA Exam

- Know that EtherChannel helps use parallel links more efficiently.
- Remember that STP sees the EtherChannel as one logical connection.
- Understand the difference between LACP and PAgP.
- Be ready to identify mismatched settings as a reason the channel does not form correctly.
- Expect comparison questions involving separate parallel links versus one logical port-channel.

## Real World Example

A distribution switch may have four uplinks to another switch. If those uplinks are left as separate links, Spanning Tree may block some of them. If they are configured as an EtherChannel, they can all contribute to the same logical connection. That gives more bandwidth, keeps redundancy, and makes the design cleaner.

## Quick Review

- EtherChannel combines several links into one logical interface.
- It improves both bandwidth and redundancy.
- LACP is open standard.
- PAgP is Cisco proprietary.
- Matching configuration across member interfaces is required.

## Key Terms

- EtherChannel
- Port-channel
- LACP
- PAgP
- Logical link
- Member interface

## Mini Practice Questions

1. What two main benefits does EtherChannel provide?
2. Which EtherChannel negotiation protocol is open standard?
3. Why is EtherChannel better than leaving parallel links as separate individual interfaces?$$,12,11,'https://youtu.be/xuo69Joy_Nc'),
    ($$2.4 Configure Layer 2 EtherChannel with LACP$$,$$configure-layer-2-etherchannel-with-lacp$$,$$Configure a switched EtherChannel and verify the logical bundle.$$,$$## Simple Explanation

A Layer 2 EtherChannel is used on switched links. The member interfaces behave together as one logical switchport.

For the CCNA, focus on why EtherChannel is used, what must match on member links, and how the logical bundle behaves differently from separate physical links.

## Key Concepts

- Member interfaces must match.
- LACP active and passive are common exam terms.
- The logical interface is the port-channel.
- EtherChannel improves resiliency while still keeping Spanning Tree behavior manageable.
- Logical bundling reduces the waste that would happen if extra parallel links were simply blocked.

## Important Points for the CCNA Exam

- Mismatched ports do not join the bundle.
- Verify both the bundle and the members.
- Mismatched interfaces are a classic reason a channel fails to form.
- You should be ready to compare Layer 2 and Layer 3 port-channels at a high level.

## Real World Example

One interface may stay out of the channel if its switchport settings do not match the others. That is why EtherChannel is so common on switch uplinks and multilayer switch connections.

## Quick Review

- Match interfaces.
- Build port-channel.
- Verify.
- The logical bundle is what the network mainly uses, not the individual links by themselves.
- Matching configuration is a non-negotiable part of EtherChannel success.

## Key Terms

- Port-channel
- Member link
- LACP active

## Mini Practice Questions

1. What must match for ports to join the channel?
2. What is the logical interface called?
3. Why is EtherChannel usually better than leaving parallel links as separate individual connections?$$,13,12,'https://youtu.be/8gKF2fMMjA8'),
    ($$2.4 Configure Layer 3 EtherChannel with LACP$$,$$configure-layer-3-etherchannel-with-lacp$$,$$Explain how routed EtherChannel differs from switched EtherChannel.$$,$$## Simple Explanation

A Layer 3 EtherChannel is a routed port-channel, not a switchport trunk or access link. It carries IP traffic directly.

For the CCNA, focus on why EtherChannel is used, what must match on member links, and how the logical bundle behaves differently from separate physical links.

## Key Concepts

- Routed EtherChannel uses Layer 3 interfaces.
- The port-channel can have an IP address.
- LACP can still negotiate the bundle.
- EtherChannel improves resiliency while still keeping Spanning Tree behavior manageable.
- Logical bundling reduces the waste that would happen if extra parallel links were simply blocked.

## Important Points for the CCNA Exam

- Layer 3 EtherChannel is routed, not switched.
- Do not confuse it with a trunk port-channel.
- Mismatched interfaces are a classic reason a channel fails to form.
- You should be ready to compare Layer 2 and Layer 3 port-channels at a high level.

## Real World Example

Two multilayer switches may use a routed port-channel for a resilient core link. That is why EtherChannel is so common on switch uplinks and multilayer switch connections.

## Quick Review

- Routed bundle.
- IP on port-channel.
- Still uses LACP.
- The logical bundle is what the network mainly uses, not the individual links by themselves.
- Matching configuration is a non-negotiable part of EtherChannel success.

## Key Terms

- Routed port
- Layer 3 EtherChannel
- Port-channel

## Mini Practice Questions

1. Does a Layer 3 EtherChannel act as a routed or switched link?
2. Can the logical interface have an IP address?
3. Why is EtherChannel usually better than leaving parallel links as separate individual connections?$$,14,12,'https://youtu.be/8gKF2fMMjA8'),
    ($$2.5 STP Fundamentals$$,$$stp-fundamentals$$,$$Understand Layer 2 loops, broadcast storms, and why Spanning Tree exists.$$,$$## Simple Explanation

Redundant links are useful because they provide backup paths if a cable or interface fails. The problem is that redundant paths at Layer 2 can create switching loops. A Layer 2 loop is dangerous because Ethernet frames do not have a built-in mechanism to stop circling the network the way routed packets do. Once a loop forms, frames can keep moving again and again.

Spanning Tree Protocol, or STP, prevents that problem by building one loop-free logical topology from a physically redundant network. Some paths forward traffic and some are held in a blocking state as backups. This gives the network both safety and redundancy.

## Key Concepts

- Layer 2 loops can form when redundant switch links exist without loop prevention.
- Broadcast storms happen when broadcast traffic keeps circulating in a loop.
- Duplicate frames can be seen when the same traffic travels repeatedly around the loop.
- MAC address table instability happens when switches keep learning the same MAC on different interfaces.
- STP blocks some paths logically to keep the topology safe.
- A blocked STP path is usually a backup path, not automatically a broken path.
- STP is one of the most important protections in campus switching.

## Important Points for the CCNA Exam

- Know the classic loop problems: broadcast storms, duplicate frames, and MAC address instability.
- Understand that STP manages redundancy instead of removing it.
- Remember that blocked ports are often normal and expected.
- Be able to explain why Ethernet switching needs loop prevention.
- Use STP fundamentals as the base for root bridge and Rapid PVST+ questions later.

## Real World Example

Imagine two switches connected by multiple paths in a small office. If one broadcast frame enters that topology and no loop prevention exists, the frame can circulate again and again. Very quickly, links become busy, MAC tables become unstable, and users lose connectivity. STP prevents that by deciding which path should forward and which path should wait as a backup.

## Quick Review

- Redundant links improve availability.
- Redundant Layer 2 links can also create loops.
- Loops cause storms, duplicate frames, and MAC instability.
- STP creates a safe loop-free logical path.
- Blocked ports are part of normal loop prevention.

## Key Terms

- STP
- Layer 2 loop
- Broadcast storm
- Duplicate frame
- MAC address instability
- Blocked port

## Mini Practice Questions

1. Why is STP needed in a switched network?
2. What is a broadcast storm?
3. Why can a blocked STP port actually be a sign of healthy loop prevention?$$,15,11,'https://youtu.be/j-bK-EFt9cY')
    ,
    ($$2.5 Root Bridge, Port Roles, and Port States$$,$$root-bridge-port-roles-and-port-states$$,$$Learn how STP chooses the root bridge and determines forwarding or blocked paths.$$,$$## Simple Explanation

STP first chooses a root bridge, then every switch works out the best path toward it. Some ports forward and some block.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Root bridge
- Root port
- Designated port
- Blocked path
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Identify the root bridge first.
- Blocked ports still receive BPDUs.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

In a triangle of switches, STP blocks one path to remove the loop. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Find root.
- Find best paths.
- Block extras.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Root bridge
- Root port
- Designated port

## Mini Practice Questions

1. What is the root bridge?
2. Why does STP block some ports?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,16,12,'https://youtu.be/nWpldCc8msY'),
    ($$2.5 STP Toolkit$$,$$stp-toolkit$$,$$Cover PortFast, BPDU Guard, BPDU Filter, Root Guard, and Loop Guard at CCNA level.$$,$$## Simple Explanation

Modern switched networks use extra STP features to make access ports safer and to protect the spanning-tree design from mistakes.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- PortFast
- BPDU Guard
- BPDU Filter
- Root Guard
- Loop Guard
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- PortFast is for end-device access ports.
- BPDU Guard is commonly paired with PortFast.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

BPDU Guard can protect the network if someone plugs in an unexpected switch on a user port. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- PortFast speeds access ports.
- Guard features protect the design.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- PortFast
- BPDU Guard
- Root Guard

## Mini Practice Questions

1. Which feature is commonly paired with PortFast?
2. Which feature helps stop an unexpected root bridge?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,17,11,'https://youtu.be/zqzppl4LOwk'),
    ($$2.5 STP Verification Lab$$,$$stp-verification-lab$$,$$Lab-style lesson for identifying the root bridge, active paths, and blocked ports.$$,$$## Simple Explanation

This lesson focuses on reading STP output and connecting it to the physical topology. The key skill is explaining why a port forwards or blocks.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Find the root bridge first.
- Identify root and designated ports.
- Check blocked paths carefully.
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Verification output is often tested.
- A blocked port may be expected, not broken.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

An engineer may see a blocked uplink and confirm it is normal STP behavior, not a hardware fault. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Read the topology.
- Read the output.
- Match the two.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Verification
- Blocked port
- Topology

## Mini Practice Questions

1. What should you identify first in an STP problem?
2. Is a blocked port always a failure?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,18,13,'https://youtu.be/Ev9gy7B5hx0'),
    ($$2.5 Rapid PVST+ Operations$$,$$rapid-pvst-plus-operations$$,$$Explain why Rapid PVST+ converges faster than older STP.$$,$$## Simple Explanation

Rapid PVST+ keeps the loop-prevention idea of STP but reacts more quickly to link and topology changes. Faster convergence means less disruption when something fails.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Faster convergence
- Same goal: loop prevention
- Better recovery after changes
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Rapid PVST+ is faster than classic STP.
- It still uses root-based path selection.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

If one uplink fails, Rapid PVST+ can move traffic to a backup path faster than older STP. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Same purpose.
- Faster recovery.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Rapid PVST+
- Convergence
- Topology change

## Mini Practice Questions

1. What is the main benefit of Rapid PVST+?
2. Does Rapid PVST+ still prevent loops?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,19,11,'https://youtu.be/EpazNsLlPps'),
    ($$2.6 Wireless Architectures Overview$$,$$wireless-architectures-overview$$,$$Compare autonomous APs with controller-based WLANs.$$,$$## Simple Explanation

Wireless networks can be built in different ways depending on size, scale, and management needs. In a small environment, each access point may be configured mostly on its own. That is often called an autonomous AP design. In a larger enterprise, many access points are usually managed through a wireless LAN controller, or WLC, which centralizes configuration, policy, and monitoring.

For the CCNA, you do not need deep wireless design detail. What you do need is a clear understanding of the difference between stand-alone wireless and centrally managed wireless, and why larger organizations usually prefer controller-based architectures.

## Key Concepts

- An autonomous AP is managed mostly as an individual device.
- A controller-based WLAN manages many APs from a central platform.
- Centralized wireless makes policy and monitoring easier at scale.
- Smaller wireless environments may use simpler autonomous designs.
- Larger environments usually need more consistent visibility and control.
- Wireless architecture affects management, troubleshooting, and growth.

## Important Points for the CCNA Exam

- Know the difference between autonomous APs and controller-based WLANs.
- Understand why controller-based wireless is common in enterprise environments.
- Be able to compare small-site simplicity with large-site scalability.
- Remember that architecture choice affects operations, not just signal coverage.
- This blueprint point is mainly about comparison and recognition.

## Real World Example

A coffee shop may use one stand-alone AP that the owner configures directly. A university campus may use hundreds of APs across many buildings, all managed by a controller that keeps SSIDs, security settings, and monitoring consistent. Both use Wi-Fi, but their architecture is different because their operational needs are different.

## Quick Review

- Autonomous APs are managed individually.
- Controller-based WLANs centralize management.
- Larger environments usually benefit from centralized wireless control.
- Architecture affects scale, visibility, and consistency.
- CCNA focuses on understanding the comparison clearly.

## Key Terms

- Autonomous AP
- Controller-based WLAN
- WLC
- Central management
- Enterprise wireless
- Wireless architecture

## Mini Practice Questions

1. What is the main difference between an autonomous AP and a controller-based WLAN?
2. Why do large enterprise wireless networks often prefer controller-based designs?
3. Why is wireless architecture about management and operations, not only about coverage?$$,20,10,'https://youtu.be/uX1h0F6wpBY')
    ,
    ($$2.6 Centralized vs Distributed Wireless Design$$,$$centralized-vs-distributed-wireless-design$$,$$Explain how centralized and distributed wireless designs differ in control and branch behavior.$$,$$## Simple Explanation

Some wireless designs keep control in one central place, while others place more responsibility closer to the edge or branch. This affects management and resilience.

For the CCNA, the goal is not deep wireless design math, but understanding how architecture choices change management style, scale, and operational control.

## Key Concepts

- Centralized control
- Distributed behavior
- Branch tradeoffs
- Wireless architecture affects not only coverage but also management, policy, and troubleshooting workflows.
- Larger environments usually need more centralized visibility and consistency.

## Important Points for the CCNA Exam

- Understand the architecture comparison.
- Different sites may need different designs.
- Compare architectures based on control and operational simplicity, not just on hardware count.
- Enterprise wireless design questions often test whether you understand scale and centralized management.

## Real World Example

A branch may need local wireless behavior if the WAN back to headquarters fails. This is why large campuses and small sites often make different architecture choices even when both use Wi-Fi.

## Quick Review

- Centralized and distributed designs solve different needs.
- Architecture affects operations.
- Wireless architecture is mainly a comparison topic at CCNA level.
- Think in terms of scale, control, and operations.

## Key Terms

- Centralized design
- Distributed design
- Branch WLAN

## Mini Practice Questions

1. Why might branch offices care about distributed behavior?
2. Is one wireless architecture always best?
3. Why do large enterprise wireless networks often choose a different architecture from small office deployments?$$,21,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 AP Modes$$,$$ap-modes$$,$$Recognize local, FlexConnect, monitor, and sniffer AP modes.$$,$$## Simple Explanation

An AP can run in different modes depending on whether it is serving clients, supporting a branch, or listening to wireless activity for analysis.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- Local mode
- FlexConnect
- Monitor mode
- Sniffer mode
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Know the basic purpose of each mode.
- This is mostly a recognition topic.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

One AP may serve users normally while another temporarily runs in sniffer mode for troubleshooting. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- Different modes mean different jobs.
- Not every AP is only for client service.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- Local mode
- FlexConnect
- Sniffer mode

## Mini Practice Questions

1. Which mode normally serves clients?
2. Which mode helps capture wireless traffic?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,22,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 Wireless Controller Deployment Models$$,$$wireless-controller-deployment-models$$,$$Explain how WLC placement and deployment model affect enterprise wireless management.$$,$$## Simple Explanation

A WLC can be deployed in ways that support campus-wide or wider enterprise wireless needs. The main CCNA idea is how controllers fit into managing many APs together.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- WLC manages many APs.
- Deployment affects scale and operations.
- Controller design connects directly to wireless architecture.
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Know that WLCs centralize management.
- Keep the topic at a design level.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

A central controller may push SSIDs and policies to APs across many buildings. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- WLC = central control.
- Placement affects operations.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- WLC
- Controller deployment
- AP adoption

## Mini Practice Questions

1. What is a WLC used for?
2. Why does controller placement matter?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,23,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 Wireless Security in Controller-Based Networks$$,$$wireless-security-in-controller-based-networks$$,$$Show how centralized wireless designs make security policy easier to apply consistently.$$,$$## Simple Explanation

Controller-based wireless designs help apply the same security settings across many APs. That makes authentication and encryption easier to manage at scale.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- Central policy
- Consistent authentication
- Consistent encryption
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Architecture affects security operations.
- Enterprise WLANs often use stronger security than home Wi-Fi.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

A hospital can push secure wireless settings from one controller instead of changing every AP separately. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- Central control helps security.
- Consistency matters.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- WPA2
- WPA3
- Enterprise WLAN

## Mini Practice Questions

1. Why is controller-based wireless good for security policy?
2. What should stay consistent across APs?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,24,10,'https://youtu.be/VvFuieyTTSw'),
    ($$2.8 Management Access Fundamentals$$,$$management-access-fundamentals$$,$$Compare console, Telnet, and SSH access in a CCNA-friendly way.$$,$$## Simple Explanation

Network devices can be managed locally with a console cable or remotely with Telnet or SSH. SSH is preferred because it protects the session with encryption.

For the CCNA, secure management is the main theme here: know which access methods are safe, how SSH is prepared, and why management access should be protected carefully.

## Key Concepts

- Console = local.
- Telnet = remote but insecure.
- SSH = remote and secure.
- Management access is part of the management plane, not ordinary user traffic.
- Security matters because management access gives control over the device itself.

## Important Points for the CCNA Exam

- Know the difference between local and remote management.
- SSH is preferred over Telnet.
- SSH is preferred not because it is remote, but because it protects the session.
- Expect simple setup and verification questions around secure remote access.

## Real World Example

An engineer may use console during an outage and SSH during normal operations. This is a routine part of device hardening before a switch or router is handed over to operations.

## Quick Review

- Console local.
- Telnet weak.
- SSH secure.
- Secure management is a baseline operational practice.
- Remote access should be protected just as carefully as user data.

## Key Terms

- Console
- Telnet
- SSH

## Mini Practice Questions

1. Which remote method is secure?
2. Which method usually requires physical access?
3. Why is secure management access treated as part of device hardening?$$,25,11,'https://youtu.be/AvgYqI2qSD4')
    ,
    ($$2.8 Configure and Verify SSH Access$$,$$configure-and-verify-ssh-access$$,$$Walk through the main CCNA-level SSH setup steps and how to verify them.$$,$$## Simple Explanation

SSH needs a hostname, domain name, local credentials, RSA keys, and VTY settings. After setup, you verify that secure remote login works.

For the CCNA, secure management is the main theme here: know which access methods are safe, how SSH is prepared, and why management access should be protected carefully.

## Key Concepts

- RSA keys
- Local username
- VTY lines
- Management access is part of the management plane, not ordinary user traffic.
- Security matters because management access gives control over the device itself.

## Important Points for the CCNA Exam

- Know the major setup pieces.
- Verification matters as much as setup.
- SSH is preferred not because it is remote, but because it protects the session.
- Expect simple setup and verification questions around secure remote access.

## Real World Example

Operations teams use SSH to manage switches securely from a central workstation. This is a routine part of device hardening before a switch or router is handed over to operations.

## Quick Review

- Prepare device.
- Generate keys.
- Verify remote access.
- Secure management is a baseline operational practice.
- Remote access should be protected just as carefully as user data.

## Key Terms

- RSA
- VTY
- Secure remote login

## Mini Practice Questions

1. What kind of key is generated for SSH?
2. Which lines control remote login behavior?
3. Why is secure management access treated as part of device hardening?$$,26,12,'https://youtu.be/QnHq7iCOtTc'),
    ($$2.9 QoS Fundamentals$$,$$qos-fundamentals$$,$$Understand delay, jitter, packet loss, bandwidth, and why QoS matters.$$,$$## Simple Explanation

Not all traffic reacts to network problems in the same way. A file download can usually survive a little extra delay, but a voice call or live video stream can become choppy very quickly if delay, jitter, or packet loss becomes too high. Quality of Service, or QoS, is the idea of giving traffic different treatment so important or time-sensitive applications perform better when the network is busy.

For the CCNA, the goal is to understand why QoS exists and what problems it tries to reduce. You do not need advanced provider-level tuning, but you do need to know the main QoS terms and why congestion makes them important.

## Key Concepts

- Delay is the time traffic takes to cross the network.
- Jitter is variation in delay.
- Packet loss means packets are dropped.
- Bandwidth is the amount of data that can be carried over a link.
- QoS is about traffic treatment, not just raw link speed.
- Different applications have different tolerance for delay, jitter, and loss.
- Voice and video are common examples of traffic that need better treatment during congestion.

## Important Points for the CCNA Exam

- Know the definitions of delay, jitter, packet loss, and bandwidth.
- Understand that QoS matters most when a link is congested.
- Be able to explain why voice traffic is more sensitive than many data applications.
- Remember that QoS does not create extra bandwidth out of nowhere; it improves treatment when resources are limited.
- Expect concept-based questions before advanced policy detail.

## Real World Example

Imagine a branch office WAN link that is busy with file transfers and backups. If a voice call shares that link without QoS, users may hear delay, breaks, or robotic audio. With QoS, the router can protect voice traffic so the call stays much more usable even while other traffic continues to cross the same connection.

## Quick Review

- Delay, jitter, and loss all affect user experience.
- Voice and video are especially sensitive to these problems.
- QoS helps important traffic during congestion.
- QoS is about treatment and priority, not only bandwidth size.
- Congestion is the main reason QoS becomes important.

## Key Terms

- QoS
- Delay
- Jitter
- Packet loss
- Bandwidth
- Congestion

## Mini Practice Questions

1. What is jitter?
2. Why does QoS matter for voice traffic more than for many file transfers?
3. Why is QoS most important when a link becomes congested?$$,27,10,'https://youtu.be/H6FKJMiiL6E'),
    ($$2.9 QoS Marking, Classification, and Queuing$$,$$qos-marking-classification-and-queuing$$,$$Explain how QoS identifies, marks, and prioritizes traffic at a CCNA concept level.$$,$$## Simple Explanation

QoS starts by identifying traffic, then marking it, then giving it the right treatment when links are busy. Queuing helps decide what gets sent first.

For the CCNA, the key is understanding why some traffic is more sensitive to congestion and how QoS tries to improve treatment when resources are limited.

## Key Concepts

- Classification
- Marking
- Prioritization
- Queuing
- QoS is about traffic treatment, not just raw speed.
- Different applications have different tolerance for delay, jitter, and loss.

## Important Points for the CCNA Exam

- Know the role of each concept.
- QoS is about traffic treatment during congestion.
- Voice and video examples are common because they clearly show why prioritization matters.
- You are usually being tested on concepts such as classification, marking, and queuing rather than complex policy syntax.

## Real World Example

Voice packets may be marked and queued ahead of low-priority bulk data. This is why QoS discussions often center on WAN links or other places where congestion is more likely.

## Quick Review

- Identify traffic.
- Mark traffic.
- Queue traffic.
- QoS matters most when not all traffic can be treated equally.
- Application sensitivity is the reason QoS exists in the first place.

## Key Terms

- Classification
- Marking
- Queuing

## Mini Practice Questions

1. What does classification do?
2. Why is queuing important?
3. Why does QoS become most important when a link is congested?$$,28,11,'https://youtu.be/4vurfhVjcMM')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'network-access'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'vlan-practice-lab'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'network-access'
  and lab.slug = 'configure-vlan-segmentation-and-trunks';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'vlan-configuration-and-verification'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'network-access'
  and challenge.slug = 'create-a-vlan-and-prepare-a-trunk';

-- Phase 33: Stripe billing provider support
alter table public.user_subscriptions
drop constraint if exists user_subscriptions_provider_check;

alter table public.user_subscriptions
add constraint user_subscriptions_provider_check
check (provider in ('dev_checkout', 'stripe'));

alter table public.payment_events
drop constraint if exists payment_events_provider_check;

alter table public.payment_events
add constraint payment_events_provider_check
check (provider in ('dev_checkout', 'stripe'));




-- Module 3: IP Connectivity full curriculum

update public.modules
set
  title = 'IP Connectivity',
  description = 'Routing tables, forwarding decisions, static routes, OSPF, and first hop redundancy for CCNA.',
  order_index = 3,
  is_published = true
where slug = 'ip-connectivity'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'ip-connectivity'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$3.1 Routing Table Components$$,$$routing-table-components$$,$$Read routing table codes, prefixes, masks, next hops, metrics, and administrative distance in common IOS output.$$,$$## Simple Explanation

A routing table is the list of networks a router knows how to reach. Each entry shows where the destination is, how the router learned about it, and which path should be used next. For the CCNA, you should be comfortable reading route codes, prefixes, masks, next hops, administrative distance, and metrics from basic IOS output.

## Key Concepts

- The routing table stores known destination networks.
- A route code shows the source of the route, such as connected or static.
- The prefix and mask describe the destination network.
- The next hop tells the router where to send the packet next.
- Administrative distance compares route source trust.
- Metric compares paths within the same routing source.

## Important Points for the CCNA Exam

- Know what route codes represent.
- Be able to read prefixes and masks in route output.
- Remember that lower administrative distance is preferred.
- Remember that metrics matter after route source trust is considered.

## Real World Example

A branch router may learn one network through a static route and another through OSPF. The routing table keeps both entries and helps the router decide which path should be used for each packet.

## Quick Review

- Routing tables guide packet forwarding.
- Route codes show where routes came from.
- Prefixes and masks define destination networks.
- Administrative distance and metric help choose between routes.

## Key Terms

- Routing table
- Route code
- Prefix
- Network mask
- Next hop
- Administrative distance
- Metric

## Mini Practice Questions

1. What does a route code tell you?
2. What is the difference between administrative distance and metric?
3. Which part of a route entry identifies the next device in the path?$$,1,12,'https://www.youtube.com/watch?v=aHwAm8GYbn8'),
    ($$3.1 Gateway of Last Resort and Default Routing$$,$$gateway-of-last-resort-and-default-routing$$,$$Understand the default route and why the gateway of last resort matters when no specific route is available.$$,$$## Simple Explanation

If a router does not have a specific route for a destination, it can use a default route instead. Cisco IOS often calls this the gateway of last resort. This gives the router a general path for unknown traffic, which is common on branch routers and internet edges.

## Key Concepts

- A default route is used when no better match exists.
- In IPv4, a default route is `0.0.0.0/0`.
- In IPv6, a default route is `::/0`.
- The gateway of last resort is the next hop for unknown destinations.

## Important Points for the CCNA Exam

- Know the meaning of gateway of last resort.
- Be able to identify IPv4 and IPv6 default routes.
- Remember that more specific routes still beat the default route.

## Real World Example

A small office router may send all internet traffic to one upstream ISP router by using a default route instead of storing many separate routes.

## Quick Review

- Default routes handle unknown destinations.
- The gateway of last resort is the fallback path.
- More specific routes are preferred first.

## Key Terms

- Default route
- Gateway of last resort
- `0.0.0.0/0`
- `::/0`

## Mini Practice Questions

1. What IPv4 prefix represents the default route?
2. When is the gateway of last resort used?
3. Will a default route beat a more specific route?$$,2,10,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.2 How Routers Make Forwarding Decisions$$,$$router-forwarding-decisions$$,$$Learn how longest prefix match, administrative distance, and metric work together when a router chooses a path.$$,$$## Simple Explanation

Routers follow a decision process when choosing how to forward packets. They first look for the most specific matching route. If more than one route still qualifies, they compare administrative distance. If the routes came from the same source, they compare metrics.

## Key Concepts

- Longest prefix match means the most specific route wins.
- Administrative distance compares route source trustworthiness.
- Metrics compare paths learned from the same routing source.
- Default routes are used only when no better match exists.

## Important Points for the CCNA Exam

- Longest prefix match comes before administrative distance.
- Administrative distance comes before metric when route sources differ.
- Metrics matter when routes come from the same protocol or source.

## Real World Example

A router may know `10.0.0.0/8`, `10.1.0.0/16`, and `10.1.1.0/24`. Traffic for `10.1.1.50` follows the `/24` route because it is the most specific match.

## Quick Review

- Routers pick the most specific route first.
- Administrative distance compares trust.
- Metric compares similar route sources.
- Default routes are the final fallback.

## Key Terms

- Longest prefix match
- Administrative distance
- Metric
- Forwarding decision

## Mini Practice Questions

1. What check happens before administrative distance?
2. When are metrics compared?
3. Why does a `/24` route beat a `/16` route for the same destination?$$,3,11,'https://www.youtube.com/watch?v=aHwAm8GYbn8'),
    ($$3.3 Configure and Verify IPv4 and IPv6 Static Routing$$,$$route-between-networks$$,$$Configure static routes for IPv4 and IPv6 and verify that routers can reach remote networks correctly.$$,$$## Simple Explanation

Static routing means a network engineer manually tells a router how to reach a remote destination. Static routes are useful when the path is simple, predictable, or used as a backup. For the CCNA, you should know how to configure and verify static routing for both IPv4 and IPv6.

## Key Concepts

- Static routes are manually configured.
- Static routes can point to a next-hop address or exit interface.
- IPv4 and IPv6 both support static routes.
- Verification often starts with route-table commands and ping tests.

## Important Points for the CCNA Exam

- Know when static routing is appropriate.
- Remember to verify both the route table and actual reachability.
- Understand that wrong next-hop information breaks forwarding.

## Real World Example

Two branch routers may use static routes to reach each other's LANs. Because the network is small and stable, the administrator can keep the design simple without a dynamic routing protocol.

## Quick Review

- Static routes are manually entered.
- They work in both IPv4 and IPv6.
- Verification includes route tables and traffic testing.

## Key Terms

- Static route
- Next hop
- Exit interface
- Verification

## Mini Practice Questions

1. What is the main difference between static and dynamic routing?
2. Which commands are commonly used to verify static routes?
3. Why can a static route fail even if the command was accepted?$$,4,13,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.3 Static Routing Lab$$,$$static-routing-lab$$,$$Practice configuring and verifying static routes in a small routed topology.$$,$$## Simple Explanation

A static routing lab helps you move from theory into real router behavior. You configure interfaces, add static routes, verify the routing table, and test end-to-end traffic. This is exactly the kind of workflow that helps with CCNA troubleshooting questions.

## Key Concepts

- Interface addressing must be correct before routing works.
- Static routes must point to the correct destination and next hop.
- Verification includes route-table checks and test traffic.
- Troubleshooting often starts with interface status and addressing.

## Important Points for the CCNA Exam

- Lab questions often mix addressing and routing together.
- A route in the table is not enough if traffic still fails.
- Missing routes and wrong next hops are common mistakes.

## Real World Example

Two routers may be fully configured at the interface level, but the LANs behind them still cannot communicate until the correct static routes are added on both sides.

## Quick Review

- Bring up interfaces first.
- Add routes second.
- Verify both the tables and the traffic.
- Troubleshoot in both directions.

## Key Terms

- Reachability
- Route verification
- Remote network
- Lab workflow

## Mini Practice Questions

1. Why should interfaces be checked before route troubleshooting?
2. Is seeing a static route in the table enough to prove the network works?
3. What are two common reasons a static routing lab fails?$$,5,14,'https://www.youtube.com/watch?v=XHxOtIav2k8'),
    ($$3.3 Default, Network, Host, and Floating Static Routes$$,$$static-route-types-and-floating-statics$$,$$Compare the main static route types used in CCNA scenarios, including backup floating static routes.$$,$$## Simple Explanation

Not all static routes serve the same purpose. A default route handles unknown destinations, a network route reaches a subnet, a host route targets one exact address, and a floating static route acts as a backup path with a higher administrative distance. Knowing these route types makes CCNA static-routing questions much easier.

## Key Concepts

- A default route is a fallback route.
- A network route points to a destination subnet.
- A host route points to one destination address.
- A floating static route is a backup route with higher administrative distance.

## Important Points for the CCNA Exam

- Know the difference between default, network, and host routes.
- Remember that floating statics are backup routes.
- Be able to explain why higher administrative distance keeps a backup inactive.

## Real World Example

A branch router may use OSPF as the main path and a static route over a slower backup link with a higher administrative distance. If OSPF disappears, the floating static route takes over.

## Quick Review

- Default routes catch unknown traffic.
- Network routes reach subnets.
- Host routes reach one exact device.
- Floating statics provide backup routing.

## Key Terms

- Default static route
- Network route
- Host route
- Floating static route

## Mini Practice Questions

1. What makes a floating static route different from a normal static route?
2. Which route type is used for one exact destination host?
3. When would a default static route be used?$$,6,12,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.4 Single-Area OSPFv2 Fundamentals$$,$$ospf-single-area-fundamentals$$,$$Understand how OSPFv2 works in a single area, including neighbors, router IDs, and basic route exchange.$$,$$## Simple Explanation

OSPF is a dynamic routing protocol that helps routers learn routes automatically. In a single-area design, all routers share their information inside one OSPF area. For the CCNA, focus on how neighbors are formed, how router IDs work, and how routes are learned after adjacency is built.

## Key Concepts

- OSPF is a link-state routing protocol.
- Single-area OSPF keeps all routers in one area.
- Routers use hello packets to discover neighbors.
- A router ID uniquely identifies the router in OSPF.
- After adjacency forms, routers exchange routing information.

## Important Points for the CCNA Exam

- Know that OSPF is dynamic, not manual like static routing.
- Understand the role of hello packets and neighbor relationships.
- Know what a router ID is and why it matters.

## Real World Example

Three routers in one campus can use OSPF to exchange routes automatically. When a new subnet appears on one router, the others learn it without manual route entry.

## Quick Review

- OSPF is a link-state protocol.
- Single-area OSPF keeps routers in one area.
- Neighbors must form before routes are shared.
- Router IDs identify routers inside OSPF.

## Key Terms

- OSPFv2
- Link-state
- Area
- Neighbor
- Router ID

## Mini Practice Questions

1. What type of routing protocol is OSPF?
2. What must happen before routers exchange full OSPF information?
3. What is the purpose of the router ID?$$,7,13,'https://www.youtube.com/watch?v=pvuaoJ9YzoI'),
    ($$3.4 OSPF Part 1 Lab$$,$$ospf-part-1-lab$$,$$Practice initial OSPF configuration and basic verification in a single-area topology.$$,$$## Simple Explanation

The first OSPF lab usually focuses on enabling OSPF, advertising the right networks, and checking whether neighbors form correctly. This turns OSPF theory into practical router behavior and builds the verification habits needed for the CCNA.

## Key Concepts

- Enable OSPF on the correct router interfaces.
- Place interfaces into the correct area.
- Verify neighbors after configuration.
- Check the routing table for learned OSPF routes.

## Important Points for the CCNA Exam

- OSPF lab questions often test wrong network statements or area mistakes.
- Neighbor formation is one of the first troubleshooting checks.
- Routes should be verified after adjacency is confirmed.

## Real World Example

An engineer enables OSPF on three routers, but no routes appear because one interface was placed in the wrong area. Once corrected, neighbors form and the routes are learned.

## Quick Review

- Enable OSPF.
- Advertise the right networks.
- Verify neighbors.
- Verify routes.

## Key Terms

- OSPF process
- Area assignment
- Neighbor verification
- Route verification

## Mini Practice Questions

1. What is one of the first things to check after enabling OSPF?
2. Can OSPF routes be learned if adjacency never forms?
3. Why should the routing table be checked after neighbor verification?$$,8,14,'https://www.youtube.com/watch?v=LeLRWjfylcs'),
    ($$3.4 OSPF Neighbor Adjacencies and Router ID$$,$$ospf-neighbor-adjacencies-and-router-id$$,$$Learn how OSPF neighbors become adjacent and why the router ID is important to the protocol.$$,$$## Simple Explanation

OSPF routers do not exchange full routing information the moment they see each other. They first check whether key settings match well enough to build an adjacency. The router ID matters because it gives each OSPF speaker a unique identity inside the protocol.

## Key Concepts

- Neighbor relationships begin with hello packets.
- Matching settings are required before full adjacency can form.
- The router ID identifies the router inside OSPF.
- Adjacency problems often come from parameter mismatches.

## Important Points for the CCNA Exam

- Know the difference between seeing a neighbor and reaching full adjacency.
- Understand that router IDs must be unique.
- Expect troubleshooting questions about failed adjacency.

## Real World Example

Two routers are connected and both have OSPF enabled, but they do not exchange routes because one important OSPF setting does not match. Once corrected, adjacency forms.

## Quick Review

- OSPF neighbors must match key settings.
- Full adjacency is required for route exchange.
- Router IDs uniquely identify routers in OSPF.

## Key Terms

- Adjacency
- Hello packet
- Router ID
- Neighbor state

## Mini Practice Questions

1. What is the purpose of the OSPF router ID?
2. Does seeing hello traffic always mean full adjacency exists?
3. Why are mismatched OSPF settings important?$$,9,12,'https://www.youtube.com/watch?v=pvuaoJ9YzoI'),
    ($$3.4 OSPF Network Types, DR, and BDR$$,$$ospf-network-types-and-dr-bdr$$,$$Understand OSPF behavior on point-to-point and broadcast links, including DR and BDR elections.$$,$$## Simple Explanation

OSPF behaves differently depending on the network type. On a point-to-point link, only two routers are involved, so the process is simple. On a broadcast network with multiple routers on one segment, OSPF uses a Designated Router and Backup Designated Router to reduce overhead.

## Key Concepts

- Point-to-point links connect two routers directly.
- Broadcast networks can have multiple routers on one segment.
- A DR is the Designated Router.
- A BDR is the Backup Designated Router.
- DR and BDR elections improve efficiency on broadcast segments.

## Important Points for the CCNA Exam

- Know the difference between point-to-point and broadcast OSPF behavior.
- Understand why DR and BDR elections exist.
- Be ready to identify DR and BDR roles from output.

## Real World Example

On a shared Ethernet segment with several routers, OSPF elects a DR and BDR so each router does not need to exchange full information with every other router in the same way.

## Quick Review

- Point-to-point links are simpler for OSPF.
- Broadcast networks may elect a DR and BDR.
- DR and BDR help control protocol overhead.

## Key Terms

- Point-to-point
- Broadcast network
- DR
- BDR
- Election

## Mini Practice Questions

1. Why does OSPF use a DR and BDR on broadcast networks?
2. Is a DR election needed on a point-to-point link?
3. Which OSPF network type is most associated with Ethernet LANs?$$,10,12,'https://www.youtube.com/watch?v=VtzfTA21ht0'),
    ($$3.4 OSPF Part 2 Lab$$,$$ospf-part-2-lab$$,$$Practice additional OSPF verification tasks that reinforce neighbor behavior and network-type understanding.$$,$$## Simple Explanation

The second OSPF lab builds on the first one. Instead of only enabling OSPF, you spend more time reading verification output and understanding how interface behavior affects the protocol. This helps connect OSPF theory to troubleshooting.

## Key Concepts

- Verification becomes deeper as OSPF knowledge grows.
- Interface details affect OSPF behavior.
- Network type affects adjacency and DR or BDR roles.
- Neighbor and route output should be read together.

## Important Points for the CCNA Exam

- Do not stop at basic enablement; learn to read OSPF verification output.
- Be comfortable checking interface-related OSPF details.
- Expect exam questions that combine neighbors, interfaces, and routes.

## Real World Example

An engineer sees that OSPF routes are present, but one router never becomes DR on a shared LAN. By checking interface and neighbor details, the behavior becomes clear.

## Quick Review

- OSPF verification should include more than one command.
- Interface behavior matters.
- Neighbor data and route data should be compared together.

## Key Terms

- OSPF verification
- Interface behavior
- Neighbor output
- Route output

## Mini Practice Questions

1. Why should OSPF verification include both neighbor and route checks?
2. Can interface behavior affect OSPF operation?
3. What does a second OSPF lab usually improve compared with the first one?$$,11,13,'https://www.youtube.com/watch?v=UEyQW-EcnY8'),
    ($$3.4 Advanced Single-Area OSPF Operations$$,$$advanced-single-area-ospf-operations$$,$$Strengthen single-area OSPF knowledge with more operational detail and CCNA-style troubleshooting thinking.$$,$$## Simple Explanation

After learning basic OSPF configuration, you need to understand how the protocol behaves in more detail. This includes cost ideas, neighbor problems, and route-verification logic. Even in one area, OSPF has enough moving parts to make operational thinking important for the CCNA.

## Key Concepts

- OSPF operation depends on matching parameters and correct interface participation.
- Costs influence path selection inside OSPF.
- Hello behavior affects neighbor formation.
- Verification output explains why routes do or do not appear.

## Important Points for the CCNA Exam

- Be able to connect OSPF route choice to cost concepts.
- Expect troubleshooting questions, not only configuration questions.
- Know that missing neighbors often lead to missing routes.

## Real World Example

A router may have OSPF enabled on the correct interfaces, but one route is still missing because adjacency never reached the proper state. Verification reveals the real problem.

## Quick Review

- OSPF requires both correct configuration and correct operation.
- Cost matters for path choice.
- Missing adjacency often means missing routes.

## Key Terms

- OSPF cost
- Path selection
- Troubleshooting
- Verification workflow

## Mini Practice Questions

1. What OSPF idea helps choose one path over another within the protocol?
2. Why can a route be missing even when OSPF is configured?
3. What should troubleshooting usually verify first in OSPF?$$,12,13,'https://www.youtube.com/watch?v=3ew26ujkiDI'),
    ($$3.4 OSPF Part 3 Lab$$,$$ospf-part-3-lab$$,$$Practice deeper OSPF verification and implementation tasks in a single-area network.$$,$$## Simple Explanation

The third OSPF lab pushes verification skills further. Instead of only confirming that OSPF works, you focus on reading protocol output with more confidence and fixing small issues by understanding how OSPF behaves.

## Key Concepts

- Repetition improves OSPF verification skill.
- Small configuration problems can have large routing effects.
- OSPF output should be interpreted, not just memorized.
- Labs help turn protocol theory into faster troubleshooting.

## Important Points for the CCNA Exam

- OSPF questions often combine several ideas in one scenario.
- Learn to reason from output instead of guessing.
- Be ready to identify why a route or neighbor is missing.

## Real World Example

During a maintenance change, an engineer notices that one router is not learning the expected OSPF route. By checking protocol state carefully, the mismatch is found and corrected.

## Quick Review

- OSPF labs build confidence.
- Output interpretation is a major skill.
- Small issues can remove routes.
- Verification should explain the result.

## Key Terms

- Output interpretation
- OSPF lab
- Single-area troubleshooting
- Verification habit

## Mini Practice Questions

1. Why are repeated OSPF labs helpful for the CCNA?
2. What is the risk of only memorizing commands without reading the output?
3. What is one goal of deeper OSPF lab practice?$$,13,14,'https://www.youtube.com/watch?v=Goekjm3bK5o'),
    ($$3.5 First Hop Redundancy Protocol Fundamentals$$,$$first-hop-redundancy-protocol-fundamentals$$,$$Understand why FHRPs provide default-gateway redundancy for end devices in a LAN.$$,$$## Simple Explanation

Hosts usually rely on one default gateway to leave the local network. If that gateway fails, users can lose access to remote resources even when the rest of the network is healthy. First hop redundancy protocols solve this by allowing multiple routers to share a virtual gateway role.

## Key Concepts

- FHRP stands for First Hop Redundancy Protocol.
- FHRPs protect the default gateway for end hosts.
- A virtual IP address can be shared between redundant routers.
- One router is active while another stands by.

## Important Points for the CCNA Exam

- Know the purpose of FHRPs in campus and branch LANs.
- Understand that hosts point to a virtual gateway, not one physical router.
- Be able to explain active and standby roles.

## Real World Example

Two distribution routers can protect the user VLAN gateway in an office. PCs use one virtual default gateway address, and the standby router takes over if the active router fails.

## Quick Review

- FHRPs protect the first-hop gateway.
- End devices use a virtual gateway address.
- Redundant routers improve availability.

## Key Terms

- FHRP
- Default gateway
- Virtual IP
- High availability
- Standby router

## Mini Practice Questions

1. What problem do FHRPs solve?
2. Do hosts normally use the virtual gateway or a physical router IP?
3. Why are active and standby roles useful?$$,14,12,'https://www.youtube.com/watch?v=43WnpwQMolo'),
    ($$3.5 First Hop Redundancy Protocol Lab$$,$$first-hop-redundancy-protocol-lab$$,$$Practice basic FHRP configuration and verification for gateway redundancy.$$,$$## Simple Explanation

An FHRP lab helps you move from theory into practical gateway redundancy. You configure redundant routers, verify the virtual gateway, and observe how failover protects user traffic. For the CCNA, the main value is understanding what normal FHRP behavior looks like and how to verify it.

## Key Concepts

- Configure redundant first-hop devices.
- Verify the virtual gateway and active role.
- Observe how failover should work.
- Confirm that users still have a working gateway after a failure.

## Important Points for the CCNA Exam

- FHRP questions focus on purpose, verification, and failover behavior.
- Be able to connect the virtual gateway idea to real host traffic.
- Verification matters because redundancy must be confirmed.

## Real World Example

An office user may never notice that one default gateway router failed because the standby router took over the virtual gateway role quickly enough to keep traffic moving.

## Quick Review

- FHRP labs focus on gateway continuity.
- Verification should confirm the active device and virtual gateway.
- Failover is the main outcome being tested.

## Key Terms

- Failover
- Virtual gateway
- Standby role
- Redundancy verification

## Mini Practice Questions

1. What should an FHRP lab verify besides basic configuration?
2. Why is failover the key behavior in an FHRP exercise?
3. How does a virtual gateway help end devices during a router failure?$$,15,13,'https://www.youtube.com/watch?v=uho5Z2nFhb8')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'ip-connectivity'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'route-between-networks'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-connectivity'
  and lab.slug = 'implement-static-routing-across-branch-routers';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'route-between-networks'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-connectivity'
  and challenge.slug = 'add-a-static-route-for-a-remote-lan';

-- Module 4: IP Services full curriculum

update public.modules
set
  title = 'IP Services',
  description = 'NAT, DHCP, DNS, NTP, SNMP, syslog, QoS, SSH, and file-transfer services for CCNA.',
  order_index = 4,
  is_published = true
where slug = 'ip-services'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'ip-services'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$4.1 NAT Fundamentals and Static NAT$$,$$nat-fundamentals-and-static-nat$$,$$Understand private and public addressing, inside and outside roles, and one-to-one static NAT mappings.$$,$$## Simple Explanation

Network Address Translation, or NAT, changes IP addresses as packets move between networks. This is useful because many internal devices use private IPv4 addresses that cannot be routed on the public internet. Static NAT creates a permanent one-to-one mapping between one inside address and one public address.

For the CCNA, focus on why NAT exists, the difference between private and public addresses, and how static NAT makes one internal device reachable through one specific translated address.

## Key Concepts

- NAT changes IP addressing information in packets.
- Private IPv4 addresses are often translated to public addresses.
- Static NAT creates a fixed one-to-one mapping.
- Inside and outside interfaces must be identified correctly.
- Static NAT is often used for servers that need predictable public reachability.

## Important Points for the CCNA Exam

- Know the purpose of NAT in IPv4 networks.
- Be able to identify inside and outside interfaces.
- Understand that static NAT always maps the same private address to the same public address.
- Remember that NAT does not replace routing. Routers still need valid routes.

## Real World Example

An internal web server might use `192.168.10.10` inside the company but appear to the internet as `203.0.113.10`. Static NAT keeps that mapping consistent so outside users can always reach the same service.

## Quick Review

- NAT translates addresses between networks.
- Static NAT is a fixed one-to-one mapping.
- Inside and outside roles must be configured correctly.
- Static NAT is common for internal servers that need outside access.

## Key Terms

- NAT
- Static NAT
- Inside local
- Inside global
- Outside interface
- Private IPv4
- Public IPv4

## Mini Practice Questions

1. What is the main purpose of NAT in IPv4 networks?
2. What type of NAT uses a permanent one-to-one mapping?
3. Why is static NAT useful for public-facing servers?$$,1,12,'https://www.youtube.com/watch?v=2TZCfTgopeg'),
    ($$4.1 Static NAT Lab$$,$$static-nat-lab$$,$$Practice configuring and verifying static NAT translations on a Cisco router.$$,$$## Simple Explanation

A static NAT lab takes the theory and turns it into router configuration. You mark interfaces as inside or outside, create the static mapping, and verify that translations appear as traffic passes through the router.

For the CCNA, lab-style questions often test whether you can recognize missing interface roles, wrong addresses in the mapping, or failed verification caused by traffic not crossing the router correctly.

## Key Concepts

- Static NAT requires inside and outside interface roles.
- The mapping must use the correct inside and global addresses.
- Verification usually includes translation-table checks and reachability tests.
- NAT entries often appear when matching traffic is generated.

## Important Points for the CCNA Exam

- A correct static NAT command is not enough if interface roles are wrong.
- Verification should include both show commands and end-to-end testing.
- Missing traffic can make it look like NAT is not working even when the configuration is correct.

## Real World Example

An engineer configures static NAT for an internal server, but outside users still cannot connect because the router interface facing the ISP was not marked as the NAT outside interface. The fix is simple once the NAT workflow is understood.

## Quick Review

- Mark inside and outside interfaces first.
- Create the static translation second.
- Generate traffic and verify the result.
- Troubleshoot interface roles before assuming the mapping itself is wrong.

## Key Terms

- NAT translation table
- Inside interface
- Outside interface
- Reachability test
- Verification

## Mini Practice Questions

1. What should be checked first if static NAT is configured but traffic still fails?
2. Why might a translation not appear immediately in the NAT table?
3. What is one useful command for verifying NAT operation?$$,2,13,'https://www.youtube.com/watch?v=vir6n_NVZFw'),
    ($$4.1 Dynamic NAT, NAT Pools, and PAT$$,$$dynamic-nat-nat-pools-and-pat$$,$$Learn how dynamic NAT uses address pools and how PAT lets many hosts share one public address.$$,$$## Simple Explanation

Dynamic NAT uses a pool of public addresses and assigns one temporarily when inside devices need outside access. Port Address Translation, or PAT, goes a step further by letting many internal devices share one public IP address by using different port numbers. In real networks, PAT is much more common than basic dynamic NAT.

For the CCNA, you should understand the difference between static NAT, dynamic NAT, and PAT, and be able to explain why PAT helps conserve public IPv4 space.

## Key Concepts

- Dynamic NAT uses a pool of public addresses.
- PAT is also called NAT overload.
- PAT allows many inside sessions to share one public IP.
- Dynamic NAT and PAT still require correct inside and outside interface roles.
- Address pools are tied to ACLs or matching traffic policies.

## Important Points for the CCNA Exam

- Know the difference between dynamic NAT and PAT.
- Remember that PAT uses port numbers to keep sessions unique.
- Be able to explain why PAT is common on internet-edge routers.
- Understand that public address conservation is one of NAT's biggest practical benefits.

## Real World Example

In a small office, dozens of users may browse the internet through one ISP-assigned public IP address. PAT makes this possible by keeping each flow separate with source port information.

## Quick Review

- Dynamic NAT uses a pool.
- PAT lets many users share one public address.
- PAT is more common than basic dynamic NAT.
- Correct interface roles and traffic matching still matter.

## Key Terms

- Dynamic NAT
- NAT pool
- PAT
- NAT overload
- Port number
- Address conservation

## Mini Practice Questions

1. What is PAT also commonly called?
2. What does dynamic NAT use to provide translated addresses?
3. Why is PAT so common on small business internet connections?$$,3,13,'https://www.youtube.com/watch?v=kILDNs4KjYE'),
    ($$4.1 Dynamic NAT and PAT Lab$$,$$dynamic-nat-and-pat-lab$$,$$Practice building NAT pools and PAT configurations and verifying translations on live traffic.$$,$$## Simple Explanation

This lab focuses on the operational side of dynamic NAT and PAT. You configure a pool or overload rule, generate client traffic, and confirm that the router builds translations correctly. This type of practice helps make NAT questions much easier because you learn what normal verification output should look like.

## Key Concepts

- NAT pools provide translated addresses for dynamic NAT.
- PAT overload rules let multiple clients share one public address.
- Verification should include translation tables and traffic tests.
- ACL matching is often part of NAT policy.

## Important Points for the CCNA Exam

- NAT labs often fail because traffic is not matching the correct ACL.
- PAT must still have correct inside and outside interface roles.
- Verification output is important because translation entries show whether the policy is actually being used.

## Real World Example

An administrator creates a NAT overload rule, but users still cannot reach the internet because the ACL does not match the internal subnet. Once the ACL is fixed, translations appear and browsing works.

## Quick Review

- Build the NAT rule.
- Match the correct traffic.
- Verify translations.
- Use testing to prove the configuration works.

## Key Terms

- NAT overload
- ACL match
- Translation entry
- NAT pool
- Verification workflow

## Mini Practice Questions

1. What common NAT problem happens when the ACL matches the wrong subnet?
2. Why are translation-table checks useful in a PAT lab?
3. Can PAT work if the inside and outside interfaces are reversed?$$,4,14,'https://www.youtube.com/watch?v=vNs1xxiwGJs'),
    ($$4.2 NTP Client and Server Fundamentals$$,$$ntp-client-and-server-fundamentals$$,$$Understand how NTP synchronizes time and how client and server roles support consistent device clocks.$$,$$## Simple Explanation

Network Time Protocol, or NTP, keeps device clocks accurate. This matters because logs, troubleshooting timelines, security features, and certificates all depend on correct time. NTP works by letting devices learn time from a trusted source instead of using their own drifting local clock.

For the CCNA, focus on why accurate time matters, how NTP client and server roles work, and why time synchronization improves operations across the whole network.

## Key Concepts

- NTP synchronizes device time.
- One device can act as an NTP server and others can act as clients.
- Accurate time improves logs, troubleshooting, and security operations.
- Unsynchronized clocks make event analysis difficult.

## Important Points for the CCNA Exam

- Know why NTP is important for network operations.
- Understand the difference between client and server roles.
- Remember that consistent time helps correlate events across devices.

## Real World Example

If a firewall log shows a login event at 10:05 but the router log shows the same event at 9:57, troubleshooting becomes confusing. NTP prevents that kind of mismatch by keeping device clocks aligned.

## Quick Review

- NTP keeps clocks synchronized.
- Client and server roles work together.
- Accurate time supports logs and security.
- Clock drift creates troubleshooting confusion.

## Key Terms

- NTP
- Time source
- NTP client
- NTP server
- Clock drift
- Time synchronization

## Mini Practice Questions

1. Why is NTP important for troubleshooting?
2. What role provides time to other devices?
3. What problem happens when device clocks drift apart?$$,5,11,'https://www.youtube.com/watch?v=qGJaJx7OfUo'),
    ($$4.2 NTP Configuration Lab$$,$$ntp-configuration-lab$$,$$Practice configuring NTP client and server behavior and verifying time synchronization on Cisco devices.$$,$$## Simple Explanation

An NTP lab helps you see whether devices are really syncing time or just configured to try. You set a time source, point clients to it, and check whether the clock and NTP status look healthy after synchronization occurs.

## Key Concepts

- NTP must reference a reachable time source.
- Clients need the correct server information.
- Verification should confirm actual synchronization, not just configuration commands.
- A healthy NTP relationship improves operational trust in logs.

## Important Points for the CCNA Exam

- NTP verification matters as much as configuration.
- A command can be present even when the client is not actually synchronized.
- Reachability to the time source still matters.

## Real World Example

A switch is configured with an NTP server address, but its clock still drifts because the server is unreachable through the network. Verification output reveals that the device never synchronized.

## Quick Review

- Configure the time source.
- Point clients to it.
- Verify synchronization.
- Confirm reachability if time still looks wrong.

## Key Terms

- Synchronization state
- Reachable time source
- Time verification
- Operational clock

## Mini Practice Questions

1. Why is verification important in an NTP lab?
2. Can a device be configured for NTP but still unsynchronized?
3. What should be checked if NTP does not appear to work?$$,6,12,'https://www.youtube.com/watch?v=Miys7Ft9wWI'),
    ($$4.3 DNS Fundamentals and Name Resolution$$,$$dns-fundamentals-and-name-resolution$$,$$Understand how DNS translates human-friendly names into IP addresses for network communication.$$,$$## Simple Explanation

DNS, or Domain Name System, helps devices find the IP address that belongs to a name like `www.example.com`. Without DNS, users would need to remember IP addresses for services instead of easy names. DNS makes modern networks and the internet much easier to use.

For the CCNA, focus on the role of DNS in name resolution and understand that DNS supports communication by translating names into addresses, not by forwarding the traffic itself.

## Key Concepts

- DNS stands for Domain Name System.
- DNS translates names into IP addresses.
- Clients send queries to DNS servers to learn address information.
- DNS supports applications by making service discovery easier.

## Important Points for the CCNA Exam

- Know that DNS provides name resolution.
- Remember that DNS is not the same as DHCP.
- Be able to explain why users normally work with names instead of raw IP addresses.

## Real World Example

When a user opens a browser and types a website name, the device usually sends a DNS query first. After learning the server IP address, the device can start building the actual connection.

## Quick Review

- DNS resolves names to addresses.
- Clients query DNS servers.
- DNS makes services easier to find.
- DNS does not replace routing or transport protocols.

## Key Terms

- DNS
- Name resolution
- Query
- DNS server
- Host name

## Mini Practice Questions

1. What is the main purpose of DNS?
2. Does DNS assign IP addresses to clients?
3. Why is DNS useful in everyday networking?$$,7,11,'https://www.youtube.com/watch?v=4C6eeQes4cs'),
    ($$4.3 DNS Lab$$,$$dns-lab$$,$$Practice basic DNS configuration and verification so clients can resolve names correctly.$$,$$## Simple Explanation

A DNS lab connects the theory of name resolution to practical behavior. You configure or verify DNS settings, test name lookups, and make sure clients can resolve the expected records. This helps build the habit of checking both name resolution and reachability during troubleshooting.

## Key Concepts

- DNS settings must point clients to the correct server.
- Name lookups can be tested directly.
- DNS problems are different from general reachability problems.
- Verification should confirm that names resolve to the expected addresses.

## Important Points for the CCNA Exam

- A device can have network connectivity but still fail DNS resolution.
- DNS troubleshooting should separate name resolution problems from routing problems.
- Verification should test both the query and the returned address information.

## Real World Example

Users may still reach a server by IP address while complaining that the website name does not work. That usually points to a DNS issue rather than a general Layer 3 failure.

## Quick Review

- Verify DNS server settings.
- Test lookups directly.
- Separate DNS problems from routing problems.
- Confirm the returned address is correct.

## Key Terms

- Name lookup
- Resolver
- Record
- Reachability
- DNS troubleshooting

## Mini Practice Questions

1. Can DNS fail even if the network path is working?
2. What does a DNS lab usually verify besides basic connectivity?
3. Why is it helpful to test by both name and IP address?$$,8,12,'https://www.youtube.com/watch?v=7D_FapNrRUM'),
    ($$4.3 DHCP Fundamentals and Address Assignment$$,$$deliver-addresses-with-dhcp$$,$$Learn how DHCP provides IP addressing information automatically to clients across the network.$$,$$## Simple Explanation

DHCP, or Dynamic Host Configuration Protocol, automatically gives clients the addressing information they need to join a network. Instead of manually configuring every host, the DHCP server can hand out an IP address, mask, default gateway, and other settings.

For the CCNA, you should understand the role of DHCP, why it scales better than manual addressing, and what basic information a DHCP client receives.

## Key Concepts

- DHCP automates host addressing.
- DHCP can provide an IP address, subnet mask, default gateway, and DNS server.
- Centralized address assignment reduces manual work.
- DHCP supports easier moves, adds, and changes in user networks.

## Important Points for the CCNA Exam

- Know what DHCP does and why networks use it.
- Remember that DHCP is different from DNS.
- Be ready to explain why large user networks benefit from automatic addressing.

## Real World Example

When a laptop joins an office Wi-Fi network, it normally receives its IP settings from DHCP within seconds. The user does not need to type the gateway or mask manually.

## Quick Review

- DHCP automates IP configuration.
- It reduces manual addressing work.
- Clients receive more than just an IP address.
- DHCP is a core operational service in enterprise networks.

## Key Terms

- DHCP
- Lease
- DHCP server
- Default gateway
- Automatic addressing

## Mini Practice Questions

1. What problem does DHCP solve?
2. Besides an IP address, what else can DHCP provide?
3. Why is DHCP preferred over manual addressing in large user networks?$$,9,11,'https://www.youtube.com/watch?v=hzkleGAC2_Y'),
    ($$4.3 DHCP Configuration Lab$$,$$dhcp-configuration-lab$$,$$Practice building a DHCP pool, excluding addresses, and verifying that clients receive the right leases.$$,$$## Simple Explanation

A DHCP lab helps you configure the service that user devices rely on every day. You build the address pool, define the default gateway, and verify that clients receive the correct lease information. This is a practical topic that shows up often in entry-level network operations.

## Key Concepts

- DHCP pools define the addresses that can be leased.
- Excluded addresses protect addresses that should remain unused or static.
- Clients must receive the correct gateway and subnet information.
- Verification should confirm both the lease and the client's usable connectivity.

## Important Points for the CCNA Exam

- DHCP labs often test missing default-router statements or wrong excluded ranges.
- A client can get an address but still fail to route if the gateway information is wrong.
- Verification should include both the DHCP binding and host behavior.

## Real World Example

An administrator configures a DHCP pool but forgets to exclude the default gateway address. A user later receives that address by mistake, creating an IP conflict that causes confusing connectivity problems.

## Quick Review

- Build the pool.
- Exclude reserved addresses.
- Verify the lease.
- Confirm the client can actually use the network.

## Key Terms

- DHCP pool
- Excluded address
- Lease binding
- Default-router
- IP conflict

## Mini Practice Questions

1. Why are excluded addresses important in DHCP?
2. Can a client receive a lease but still be unable to route?
3. What is one common DHCP lab misconfiguration?$$,10,13,'https://www.youtube.com/watch?v=cgMsoIQB9Wk'),
    ($$4.4 SNMP Fundamentals$$,$$snmp-fundamentals$$,$$Understand how SNMP helps monitor and manage network devices during day-to-day operations.$$,$$## Simple Explanation

SNMP, or Simple Network Management Protocol, allows network devices to share operational information with a management system. This helps administrators monitor device health, interfaces, counters, and alerts without logging into every device manually.

For the CCNA, the main goal is understanding that SNMP supports monitoring and management, not packet forwarding. It gives visibility into the network so issues can be seen and handled faster.

## Key Concepts

- SNMP stands for Simple Network Management Protocol.
- Management systems can poll devices for information.
- Devices can also send notifications for important events.
- SNMP supports operational visibility and centralized monitoring.

## Important Points for the CCNA Exam

- Know the overall purpose of SNMP.
- Be able to explain the difference between monitoring and forwarding.
- Remember that SNMP is part of network operations and management.

## Real World Example

An administrator may use a monitoring platform to watch interface utilization on dozens of routers and switches. SNMP allows that information to be collected from the devices without checking each one manually.

## Quick Review

- SNMP supports network monitoring.
- It helps collect device information centrally.
- SNMP improves operational visibility.
- It is a management service, not a routing protocol.

## Key Terms

- SNMP
- Network monitoring
- Polling
- Notification
- Management platform

## Mini Practice Questions

1. What is the main role of SNMP?
2. Does SNMP forward user traffic between networks?
3. Why is SNMP useful in large environments?$$,11,11,'https://www.youtube.com/watch?v=HXu0Ifj0oWU'),
    ($$4.4 SNMP Lab$$,$$snmp-lab$$,$$Practice basic SNMP configuration and verification so monitoring systems can read useful device information.$$,$$## Simple Explanation

In an SNMP lab, you configure the device so a management system can collect information from it. This gives practical experience with how network monitoring is enabled and how visibility depends on both configuration and verification.

## Key Concepts

- SNMP must be configured before monitoring tools can use it.
- Verification confirms that the device is exposing the intended data.
- Monitoring depends on reachability as well as correct SNMP settings.
- SNMP configuration supports operations teams more than end users.

## Important Points for the CCNA Exam

- Know that management services still require network connectivity.
- Verification matters because monitoring tools depend on successful SNMP communication.
- Expect operational questions about why a monitoring platform is not receiving device data.

## Real World Example

An NMS may show one switch as down even though the switch is forwarding traffic normally. The issue can be a missing SNMP configuration rather than a device failure.

## Quick Review

- Configure SNMP.
- Confirm reachability.
- Verify the monitoring platform can communicate.
- Separate service-monitoring issues from forwarding issues.

## Key Terms

- NMS
- SNMP configuration
- Management reachability
- Operational visibility

## Mini Practice Questions

1. Why might a monitoring tool fail even when the switch still forwards traffic?
2. What must exist besides SNMP configuration for monitoring to work?
3. Why is SNMP considered an operations tool?$$,12,12,'https://www.youtube.com/watch?v=v8WxIytUdS4'),
    ($$4.5 Syslog Facilities and Severity Levels$$,$$syslog-facilities-and-severity-levels$$,$$Learn how syslog messages are categorized so administrators can collect and prioritize network events.$$,$$## Simple Explanation

Syslog is the standard way many network devices send log messages about events, warnings, and failures. These messages help administrators understand what happened on the device and when it happened. Syslog uses severity levels so teams can separate minor information from critical problems.

For the CCNA, focus on the purpose of syslog, why severity levels matter, and how centralized logging improves troubleshooting and operations.

## Key Concepts

- Syslog carries device event messages.
- Severity levels help rank message importance.
- Facilities help categorize where messages come from.
- Centralized logging makes troubleshooting easier.

## Important Points for the CCNA Exam

- Know that lower syslog severity numbers are more critical.
- Understand why centralized log collection matters.
- Be able to connect syslog usefulness to troubleshooting and auditing.

## Real World Example

If several devices all send authentication warnings and interface-failure messages to one syslog server, the administrator can quickly see patterns across the network instead of checking each device one by one.

## Quick Review

- Syslog records device events.
- Severity levels rank urgency.
- Facilities help classify messages.
- Centralized syslog improves visibility.

## Key Terms

- Syslog
- Facility
- Severity level
- Centralized logging
- Event message

## Mini Practice Questions

1. Why are severity levels useful in syslog?
2. What is the benefit of sending logs to a central server?
3. Does syslog help with troubleshooting or only with security?$$,13,11,'https://www.youtube.com/watch?v=RaQPSKQ4J5A'),
    ($$4.5 Syslog Lab$$,$$syslog-lab$$,$$Practice sending device logs to a syslog destination and verifying that messages are recorded correctly.$$,$$## Simple Explanation

A syslog lab shows the path from device events to centralized log collection. You configure the logging destination, generate or inspect messages, and verify that the remote server receives them. This helps turn the idea of centralized logging into a practical operational workflow.

## Key Concepts

- Devices need the correct logging destination.
- Useful verification includes both local and remote log checks.
- Accurate device time improves log value.
- Logging services support troubleshooting and auditing.

## Important Points for the CCNA Exam

- Syslog is more useful when device time is correct.
- Log delivery depends on basic IP reachability.
- Verification should confirm that messages actually arrive, not just that the command exists.

## Real World Example

An engineer configures a remote syslog server but sees no messages there because the device clock is wrong and the server address was mistyped. Verification of both time and reachability leads to the fix.

## Quick Review

- Configure the syslog destination.
- Verify reachability and time.
- Confirm messages arrive remotely.
- Use centralized logs to support troubleshooting.

## Key Terms

- Remote log server
- Log delivery
- Message verification
- Time correlation

## Mini Practice Questions

1. Why does accurate time make syslog more useful?
2. What should be checked if no messages reach the syslog server?
3. Is remote logging verified only by reading the running configuration?$$,14,12,'https://www.youtube.com/watch?v=Pn8jJQKxN4A'),
    ($$4.6 DHCP Client and Relay$$,$$dhcp-client-and-relay$$,$$Understand how DHCP relay helps clients reach a remote server and how devices behave as DHCP clients.$$,$$## Simple Explanation

DHCP clients often sit on different networks from the DHCP server. Because DHCP discovery starts as a broadcast, routers normally stop it at the subnet boundary. DHCP relay solves this by forwarding the client request to the remote DHCP server so the client can still receive addressing information.

For the CCNA, focus on the difference between DHCP client behavior and DHCP relay behavior, and why relay is needed in routed enterprise networks.

## Key Concepts

- DHCP clients request addressing information automatically.
- Initial DHCP messages are broadcast on the local network.
- Routers do not forward broadcasts by default.
- DHCP relay forwards requests to a remote DHCP server.

## Important Points for the CCNA Exam

- Know why DHCP relay is needed across Layer 3 boundaries.
- Understand that clients do not need the DHCP server on the same subnet if relay is configured.
- Be able to connect broadcast behavior to the need for relay.

## Real World Example

An enterprise may keep one central DHCP server in the data center while user VLANs exist in many buildings. Each local gateway interface relays DHCP requests so clients can still get leases from the central server.

## Quick Review

- DHCP starts with broadcast behavior.
- Routers stop broadcasts unless relay is used.
- DHCP relay forwards client requests to a remote server.
- Central DHCP designs often depend on relay.

## Key Terms

- DHCP client
- DHCP relay
- Broadcast
- Remote DHCP server
- Layer 3 boundary

## Mini Practice Questions

1. Why is DHCP relay needed in many enterprise networks?
2. Do routers forward DHCP broadcasts by default?
3. Can a client use a DHCP server on another subnet when relay is configured?$$,15,11,'https://www.youtube.com/watch?v=hzkleGAC2_Y'),
    ($$4.6 DHCP Relay Lab$$,$$dhcp-relay-lab$$,$$Practice configuring DHCP relay so clients can receive leases from a server on another subnet.$$,$$## Simple Explanation

In a DHCP relay lab, you configure a routed interface to forward client DHCP requests to a remote server. This helps you see how routed networks still support centralized address assignment without placing a DHCP server in every VLAN.

## Key Concepts

- DHCP relay is configured on the interface that receives the client broadcast.
- The relay points toward the remote DHCP server.
- Verification should confirm both lease assignment and end-user connectivity.
- Relay problems often look like DHCP server problems until the packet path is checked.

## Important Points for the CCNA Exam

- Know where DHCP relay is configured.
- Remember that wrong relay addresses prevent lease delivery.
- Verification should include both the client result and the router configuration.

## Real World Example

Clients in a user VLAN may fail to get addresses even though the DHCP server is healthy. The real problem can be a missing relay command on the default gateway interface for that VLAN.

## Quick Review

- Configure relay on the gateway interface.
- Point it to the remote server.
- Verify the client receives a lease.
- Troubleshoot the relay path if DHCP fails.

## Key Terms

- Relay agent
- Remote lease
- Gateway interface
- Centralized DHCP

## Mini Practice Questions

1. On which device or interface is DHCP relay typically configured?
2. What happens if the relay points to the wrong server address?
3. Why can DHCP relay issues be mistaken for DHCP server failures?$$,16,12,'https://www.youtube.com/watch?v=cgMsoIQB9Wk'),
    ($$4.7 QoS Classification, Marking, and Prioritization$$,$$qos-classification-marking-and-prioritization$$,$$Learn how QoS identifies important traffic and marks it so delay-sensitive applications receive better treatment.$$,$$## Simple Explanation

Quality of Service, or QoS, helps networks treat important traffic differently from less important traffic. The first part of QoS is identifying which traffic matters and marking it so devices know how it should be handled later. This is especially useful for voice and video, where delay and jitter hurt the user experience quickly.

For the CCNA, you should understand classification, marking, and why priority treatment matters for real-time applications.

## Key Concepts

- QoS stands for Quality of Service.
- Classification identifies traffic types.
- Marking labels traffic so devices know how to treat it.
- Prioritization gives important traffic better handling under load.
- Voice and video are common QoS examples.

## Important Points for the CCNA Exam

- Know the difference between classification and marking.
- Be able to explain why some traffic gets higher priority.
- Remember that QoS matters most when the network is under congestion.

## Real World Example

In a busy branch office, voice calls and a large file transfer may share the same WAN link. QoS helps protect the voice traffic so call quality stays acceptable even when the link is busy.

## Quick Review

- QoS helps manage traffic under load.
- Classification identifies the traffic.
- Marking labels it for handling.
- Priority treatment often protects voice and video.

## Key Terms

- QoS
- Classification
- Marking
- Prioritization
- Delay
- Jitter

## Mini Practice Questions

1. What does QoS classification do?
2. Why is marking useful after traffic is identified?
3. What type of traffic often needs priority treatment?$$,17,11,'https://www.youtube.com/watch?v=H6FKJMiiL6E'),
    ($$4.7 QoS Queuing, Congestion, Policing, and Shaping$$,$$qos-queuing-congestion-policing-and-shaping$$,$$Understand how QoS manages congestion and controls traffic flow with queuing, policing, and shaping.$$,$$## Simple Explanation

Once traffic is classified and marked, the network still needs a way to decide what happens during congestion. QoS uses queuing to decide the order of transmission, policing to limit traffic, and shaping to smooth traffic rates. These behaviors make WAN links and other shared paths more predictable.

## Key Concepts

- Queuing decides the order packets are sent.
- Congestion happens when demand is higher than available bandwidth.
- Policing enforces a rate by dropping or remarking excess traffic.
- Shaping buffers traffic to smooth the sending rate.
- QoS behavior is most visible on congested links.

## Important Points for the CCNA Exam

- Know the difference between policing and shaping.
- Understand that queuing is about transmission order under congestion.
- Be able to connect congestion control to real user experience.

## Real World Example

A WAN link may become busy during backups or large data transfers. Queuing protects critical voice traffic, while shaping smooths large data flows so the circuit is used more predictably.

## Quick Review

- Congestion creates the need for QoS decisions.
- Queuing affects send order.
- Policing limits excess traffic.
- Shaping smooths traffic rather than dropping it immediately.

## Key Terms

- Queuing
- Congestion
- Policing
- Shaping
- Bandwidth management

## Mini Practice Questions

1. What is the difference between policing and shaping?
2. Why is queuing important during congestion?
3. When does QoS become especially important?$$,18,12,'https://www.youtube.com/watch?v=4vurfhVjcMM'),
    ($$4.7 QoS Lab$$,$$qos-lab$$,$$Practice basic QoS verification and observe how marked traffic is handled under policy control.$$,$$## Simple Explanation

A QoS lab helps connect abstract QoS ideas to practical device behavior. You apply or verify policy settings, inspect how traffic is classified, and confirm that the network handles important traffic in the expected way.

## Key Concepts

- QoS policies should match the intended traffic classes.
- Verification matters because policy logic must be proven, not assumed.
- Traffic handling changes are easiest to observe when congestion or prioritization is present.
- QoS troubleshooting often starts with classification and marking checks.

## Important Points for the CCNA Exam

- QoS labs often focus on understanding policy behavior, not only entering commands.
- Verification should show whether traffic matched the expected class.
- Misclassification can make a good policy behave badly.

## Real World Example

A voice policy may exist on the WAN interface, but calls still sound poor because the traffic was never matched into the expected class. QoS verification reveals the policy is present but not being applied to the right packets.

## Quick Review

- Build or inspect the policy.
- Verify traffic matches the right class.
- Confirm important traffic is treated correctly.
- Troubleshoot classification before assuming the policy design is wrong.

## Key Terms

- QoS policy
- Traffic class
- Match criteria
- Policy verification

## Mini Practice Questions

1. Why can a QoS policy fail even when it exists on the interface?
2. What should be checked first when important traffic is not being prioritized?
3. Why is verification a major part of QoS labs?$$,19,13,'https://www.youtube.com/watch?v=63tD4t8189k'),
    ($$4.8 SSH Remote Access Fundamentals$$,$$ssh-remote-access-fundamentals$$,$$Understand why SSH is preferred for remote management and how it protects device access.$$,$$## Simple Explanation

Network devices often need to be managed remotely. SSH provides that remote command-line access in a secure way by encrypting the session. This is much safer than older insecure methods because usernames, passwords, and commands are protected while they cross the network.

For the CCNA, focus on why SSH is used, how it differs from insecure remote access, and why secure management is part of normal network operations.

## Key Concepts

- SSH provides encrypted remote CLI access.
- Secure remote management protects credentials and commands.
- SSH is preferred over insecure remote access methods.
- Remote access is part of the device management plane.

## Important Points for the CCNA Exam

- Know why SSH is considered secure remote access.
- Be able to explain why encryption matters for management traffic.
- Remember that secure management is an operational best practice, not just a security luxury.

## Real World Example

An engineer managing a branch router from headquarters should use SSH instead of sending credentials in clear text across the WAN. Secure remote access protects the device and the administrator's session.

## Quick Review

- SSH is used for secure remote device management.
- It encrypts management traffic.
- Secure management reduces operational risk.
- SSH is preferred over insecure remote-access methods.

## Key Terms

- SSH
- Remote access
- Encryption
- Management plane
- Secure CLI

## Mini Practice Questions

1. Why is SSH preferred for remote device management?
2. What kind of traffic does SSH protect?
3. Is SSH mainly a data-forwarding protocol or a management protocol?$$,20,11,'https://www.youtube.com/watch?v=AvgYqI2qSD4'),
    ($$4.8 SSH Lab$$,$$ssh-lab$$,$$Practice configuring and verifying SSH so network devices can be managed securely from a remote location.$$,$$## Simple Explanation

An SSH lab focuses on the steps needed to make secure remote access work in real life. You create local credentials, enable the right crypto support, configure the management lines, and test the login from another device.

## Key Concepts

- SSH requires more than just a password on the VTY lines.
- Local credentials and key generation are common parts of SSH setup.
- Verification should confirm that remote access works and that insecure methods are no longer required.
- Management access depends on both service configuration and IP reachability.

## Important Points for the CCNA Exam

- SSH labs often test missing RSA keys, wrong VTY settings, or incomplete login configuration.
- A device can be configured for SSH and still fail if basic IP reachability is missing.
- Verification should confirm that the secure method works end to end.

## Real World Example

An administrator enables VTY login but cannot connect with SSH because the device never generated its cryptographic keys. Once that missing step is completed, secure remote access starts working.

## Quick Review

- Build the SSH prerequisites.
- Configure the remote-access lines.
- Verify secure login.
- Check both configuration and reachability if access fails.

## Key Terms

- VTY
- RSA key
- Secure login
- Remote CLI verification

## Mini Practice Questions

1. What missing step often breaks SSH even when usernames and passwords exist?
2. Why must reachability still be verified in an SSH lab?
3. What should be confirmed after SSH is configured?$$,21,13,'https://www.youtube.com/watch?v=QnHq7iCOtTc'),
    ($$4.9 FTP and TFTP Fundamentals$$,$$ftp-and-tftp-fundamentals$$,$$Understand how FTP and TFTP are used to move files such as IOS images and configuration backups across the network.$$,$$## Simple Explanation

Network devices often need to send or receive files such as configuration backups, software images, or support files. FTP and TFTP are two common file-transfer options used in network operations. FTP offers more features, while TFTP is simpler and lighter.

For the CCNA, focus on the purpose of FTP and TFTP, what kinds of files they move, and why administrators use them for device operations.

## Key Concepts

- FTP and TFTP move files across the network.
- These protocols are commonly used for backups and software management.
- FTP is feature-rich compared with TFTP.
- TFTP is simple and lightweight, often used in controlled environments.

## Important Points for the CCNA Exam

- Know the operational purpose of FTP and TFTP.
- Be able to compare the simplicity of TFTP with the richer feature set of FTP.
- Remember that file transfer is part of network operations, not packet forwarding logic.

## Real World Example

Before upgrading a router, an administrator may copy the running configuration to a server and later download a new IOS image. FTP or TFTP can be used depending on the environment and the tools available.

## Quick Review

- FTP and TFTP transfer files.
- They support backups and software workflows.
- FTP is richer in features.
- TFTP is simpler and lighter.

## Key Terms

- FTP
- TFTP
- Configuration backup
- IOS image
- File transfer

## Mini Practice Questions

1. What two kinds of files are commonly moved with FTP or TFTP?
2. Which protocol is generally simpler, FTP or TFTP?
3. Why are FTP and TFTP important in network operations?$$,22,11,'https://www.youtube.com/watch?v=50hcfsoBf4Q'),
    ($$4.9 FTP and TFTP Lab$$,$$ftp-and-tftp-lab$$,$$Practice copying files to and from network devices by using FTP and TFTP workflows.$$,$$## Simple Explanation

An FTP and TFTP lab turns file-transfer theory into operational practice. You test how a device copies a file to or from a server, verify the transfer succeeds, and connect the workflow to common tasks such as backups and software maintenance.

## Key Concepts

- File transfers should be verified after the copy starts.
- Backup workflows depend on both server availability and network reachability.
- Administrators often use file-transfer tools before and after major changes.
- Lab practice builds confidence for backup and recovery procedures.

## Important Points for the CCNA Exam

- Expect operational questions about copying files to protect configs or load images.
- Verification matters because failed transfers can leave maintenance incomplete.
- Reachability to the server is still part of the troubleshooting path.

## Real World Example

Before reloading a switch during maintenance, an engineer uploads the current configuration to a server. If the change goes badly, that backup becomes critical for recovery.

## Quick Review

- Connect the device to the file server.
- Start the transfer.
- Verify success.
- Treat backups as part of normal operational discipline.

## Key Terms

- File copy
- Backup workflow
- Recovery preparation
- Transfer verification

## Mini Practice Questions

1. Why should a configuration backup be taken before major changes?
2. What should be checked if an FTP or TFTP copy fails?
3. Why are file-transfer labs useful for real operations?$$,23,12,'https://www.youtube.com/watch?v=W9PLvA2wZ28')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'ip-services'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'deliver-addresses-with-dhcp'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-services'
  and lab.slug = 'configure-dhcp-and-pat-services';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'deliver-addresses-with-dhcp'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-services'
  and challenge.slug = 'build-a-dhcp-pool-for-user-devices';

-- Module 5: Security Fundamentals full curriculum

update public.modules
set
  title = 'Security Fundamentals',
  description = 'Core security concepts, device access control, ACLs, Layer 2 protections, AAA, and WLAN security for CCNA.',
  order_index = 5,
  is_published = true
where slug = 'security-fundamentals'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'security-fundamentals'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$5.1 Key Security Concepts$$,$$key-security-concepts$$,$$Understand threats, vulnerabilities, exploits, and mitigation ideas that appear throughout CCNA security topics.$$,$$## Simple Explanation

Security starts with understanding what can go wrong in a network. A threat is something that can cause harm, a vulnerability is a weakness, and an exploit is the method used to take advantage of that weakness. Mitigation means reducing the risk or limiting the damage.

For the CCNA, these core terms matter because nearly every security topic builds on them. Once you understand the relationship between threat, vulnerability, exploit, and mitigation, it becomes much easier to reason through real security scenarios.

## Key Concepts

- A threat is a possible danger to the network.
- A vulnerability is a weakness that could be used by an attacker.
- An exploit is the action or tool that uses the weakness.
- Mitigation reduces risk through controls, policies, or design changes.
- Security work often focuses on reducing attack surface and improving visibility.

## Important Points for the CCNA Exam

- Know the difference between threats, vulnerabilities, and exploits.
- Be ready to connect mitigations to specific risks.
- Understand that good security reduces risk but does not remove all risk.

## Real World Example

If a router still allows an insecure legacy service, that service is a vulnerability. An attacker who uses it to gain access is performing an exploit. Disabling the unused service is one mitigation.

## Quick Review

- Threat means danger.
- Vulnerability means weakness.
- Exploit means using the weakness.
- Mitigation means reducing the risk.

## Key Terms

- Threat
- Vulnerability
- Exploit
- Mitigation
- Attack surface

## Mini Practice Questions

1. What is the difference between a vulnerability and an exploit?
2. What does mitigation mean in security?
3. Why is attack surface reduction useful?$$,1,11,'https://www.youtube.com/watch?v=VvFuieyTTSw'),
    ($$5.2 Security Program Elements$$,$$security-program-elements$$,$$Learn how awareness, training, and physical access control support the technical side of network security.$$,$$## Simple Explanation

Security is not only about commands and devices. A strong security program also includes user awareness, staff training, physical access control, and repeatable processes. These elements help reduce human mistakes and make it harder for attackers to access systems directly.

For the CCNA, the main idea is that technical controls work best when they are supported by people and policy. A secure network depends on both operational discipline and technical design.

## Key Concepts

- User awareness helps people recognize common risks.
- Training improves secure daily behavior.
- Physical access control protects devices from direct tampering.
- Security programs depend on process, policy, and accountability.

## Important Points for the CCNA Exam

- Be able to explain why physical security still matters in a network.
- Know that human behavior is a major part of security risk.
- Understand that awareness and training reduce avoidable mistakes.

## Real World Example

A locked network closet, badge-based access, and regular phishing-awareness training all improve security even though none of them are routing or switching commands.

## Quick Review

- Security programs include people, process, and physical controls.
- User awareness reduces mistakes.
- Training builds better habits.
- Physical access control protects devices directly.

## Key Terms

- Security awareness
- Training
- Physical access control
- Policy
- Accountability

## Mini Practice Questions

1. Why is physical security important for network devices?
2. How does user awareness help a security program?
3. Are technical controls enough by themselves?$$,2,10,'https://www.youtube.com/watch?v=VvFuieyTTSw'),
    ($$5.3 Configure and Verify Device Access Control Using Local Passwords$$,$$secure-device-management$$,$$Practice securing console and remote access with local password controls and basic verification.$$,$$## Simple Explanation

Before a device can be managed safely, access to the console and management lines must be controlled. Local passwords and local user accounts help limit who can access the device. This is one of the first security steps taken on new routers and switches.

For the CCNA, focus on the purpose of local password protection, where those controls are applied, and why verification matters after configuration. Even simple local access controls can stop accidental or unauthorized access when they are configured correctly.

## Key Concepts

- Device access control protects the console and management lines.
- Local passwords are a basic way to restrict access.
- Verification should confirm that access works for authorized users only.
- Secure management starts with controlling who can log in.

## Important Points for the CCNA Exam

- Know that console and VTY access should be protected.
- Remember that access control is part of hardening, not an optional extra.
- Be able to explain why verification is important after password changes.

## Real World Example

An engineer may receive a new switch from storage and first configure console protection, local credentials, and secure management access before placing the device into production.

## Quick Review

- Protect device access early.
- Local passwords provide a basic control.
- Verification confirms the device is no longer openly accessible.
- Secure management begins with login protection.

## Key Terms

- Local password
- Console access
- VTY access
- Management hardening
- Login verification

## Mini Practice Questions

1. Which device access paths should be protected with local credentials?
2. Why should login behavior be tested after changing passwords?
3. Is device access control part of hardening or only troubleshooting?$$,3,12,'https://www.youtube.com/watch?v=SDocmq1c05s'),
    ($$5.4 Security Password Policy Elements$$,$$security-password-policy-elements$$,$$Understand password complexity, MFA, certificates, biometrics, and other identity controls used in security policy.$$,$$## Simple Explanation

Password policy is about more than just choosing a secret word. Good policy defines how strong passwords should be, how they are stored and rotated, and when stronger identity methods such as multifactor authentication, certificates, or biometrics should be used.

For the CCNA, the key goal is to understand the purpose of these controls and how they improve identity assurance. Stronger authentication policies reduce the chance that stolen or weak passwords will lead to compromise.

## Key Concepts

- Complexity rules help make passwords harder to guess.
- Password management includes storage, rotation, and reuse limits.
- Multifactor authentication uses more than one type of proof.
- Certificates and biometrics are additional identity mechanisms.
- Better identity controls reduce unauthorized access risk.

## Important Points for the CCNA Exam

- Know what MFA means.
- Be able to explain why complexity rules exist.
- Understand that certificates and biometrics can strengthen authentication.

## Real World Example

A company may require long passwords, block password reuse, and add MFA for remote administrative access. This makes it much harder for a stolen password alone to give full access.

## Quick Review

- Strong policy improves authentication.
- MFA means more than one factor.
- Complexity rules reduce weak passwords.
- Certificates and biometrics can strengthen identity checks.

## Key Terms

- Password complexity
- MFA
- Certificate
- Biometrics
- Password rotation

## Mini Practice Questions

1. What does multifactor authentication require?
2. Why do organizations use password complexity rules?
3. How can certificates help with authentication?$$,4,11,'https://www.youtube.com/watch?v=VvFuieyTTSw'),
    ($$5.5 IPsec Remote Access and Site-to-Site VPNs$$,$$ipsec-remote-access-and-site-to-site-vpns$$,$$Compare remote-access and site-to-site VPN concepts and understand why IPsec is used to protect traffic.$$,$$## Simple Explanation

Virtual Private Networks, or VPNs, let traffic move securely across an untrusted network such as the internet. IPsec is a common technology used to protect that traffic. Remote-access VPNs connect individual users, while site-to-site VPNs connect whole networks together.

For the CCNA, you do not need deep encryption math. Focus on the purpose of IPsec, the difference between remote-access and site-to-site VPNs, and why these designs matter for branch offices and remote workers.

## Key Concepts

- VPNs protect traffic across untrusted networks.
- IPsec is commonly used for VPN security.
- Remote-access VPNs connect individual users.
- Site-to-site VPNs connect separate networks or locations.
- VPNs support privacy and secure communication over shared infrastructure.

## Important Points for the CCNA Exam

- Know the difference between remote-access and site-to-site VPNs.
- Understand the basic purpose of IPsec.
- Be able to connect VPNs to real branch or remote-user scenarios.

## Real World Example

A remote employee may use a VPN client to reach internal applications from home, while two branch offices may use a site-to-site IPsec tunnel so their routers can exchange protected traffic over the internet.

## Quick Review

- VPNs secure traffic over untrusted networks.
- IPsec is a major VPN technology.
- Remote-access VPNs connect users.
- Site-to-site VPNs connect networks.

## Key Terms

- VPN
- IPsec
- Remote-access VPN
- Site-to-site VPN
- Tunnel

## Mini Practice Questions

1. What is the difference between a remote-access VPN and a site-to-site VPN?
2. Why is IPsec used in VPNs?
3. What type of VPN is most appropriate for connecting two offices?$$,5,11,'https://www.youtube.com/watch?v=BW3fQgdf4-w'),
    ($$5.6 Standard ACL Fundamentals$$,$$access-control-lists-foundations$$,$$Learn how standard ACLs filter traffic by source address and where they are commonly placed.$$,$$## Simple Explanation

Access control lists, or ACLs, are used to permit or deny traffic. Standard ACLs make decisions based only on the source IPv4 address. Because they are less specific than extended ACLs, their placement matters a lot.

For the CCNA, you should understand what standard ACLs can match, how their logic is processed from top to bottom, and why careful placement helps avoid blocking more traffic than intended.

## Key Concepts

- ACL stands for access control list.
- Standard ACLs match source IPv4 addresses.
- ACL entries are checked in order.
- The first matching line decides the outcome.
- Placement matters because standard ACLs are less specific.

## Important Points for the CCNA Exam

- Know that standard ACLs match only the source address.
- Remember that ACLs use top-down processing.
- Be able to explain why standard ACLs are often placed closer to the destination.

## Real World Example

If you want to block one user subnet from reaching one remote network, a poorly placed standard ACL might block that subnet from many destinations instead of only the one you intended.

## Quick Review

- Standard ACLs match source addresses.
- Order matters.
- First match wins.
- Placement affects how much traffic is impacted.

## Key Terms

- ACL
- Standard ACL
- Source address
- First match
- Implicit deny

## Mini Practice Questions

1. What does a standard ACL match on?
2. Why does entry order matter in an ACL?
3. Why are standard ACLs often placed near the destination?$$,6,12,'https://www.youtube.com/watch?v=z023_eRUtSo'),
    ($$5.6 Standard ACL Lab$$,$$standard-acl-lab$$,$$Practice creating and verifying a standard ACL so only approved source networks are permitted.$$,$$## Simple Explanation

A standard ACL lab helps you move from ACL theory into actual interface behavior. You create the ACL, apply it in the right direction, and verify that the intended source traffic is permitted or denied correctly.

## Key Concepts

- Standard ACLs must be created before they can be applied.
- The interface and direction matter.
- Verification should confirm both allowed and blocked traffic.
- ACL mistakes often come from order or placement problems.

## Important Points for the CCNA Exam

- Be able to connect ACL logic to interface placement.
- Remember that an ACL can exist but still fail because it was applied incorrectly.
- Verification should include traffic testing, not just configuration review.

## Real World Example

An administrator builds the right ACL entries but applies the ACL on the wrong interface. The result is unexpected traffic behavior until placement is corrected.

## Quick Review

- Build the ACL.
- Apply it correctly.
- Verify both permit and deny behavior.
- Check interface and direction first during troubleshooting.

## Key Terms

- ACL application
- Inbound
- Outbound
- Traffic test
- Verification

## Mini Practice Questions

1. What two placement details matter when applying an ACL?
2. Why should both allowed and denied traffic be tested?
3. Can a correct ACL fail if applied in the wrong place?$$,7,13,'https://www.youtube.com/watch?v=sJ8PXmiAkvs'),
    ($$5.6 Extended ACL Fundamentals$$,$$extended-acl-fundamentals$$,$$Understand how extended ACLs filter by source, destination, protocol, and ports for more precise traffic control.$$,$$## Simple Explanation

Extended ACLs are more detailed than standard ACLs. They can match source addresses, destination addresses, protocols, and sometimes port numbers. This makes them much more precise and useful when you need to control a specific kind of traffic.

For the CCNA, focus on the difference between standard and extended ACLs, and understand why extended ACLs are often placed closer to the source to stop unwanted traffic earlier.

## Key Concepts

- Extended ACLs match more fields than standard ACLs.
- They can filter based on protocol and application port numbers.
- Greater precision allows more targeted traffic control.
- Placement closer to the source often prevents unnecessary transit traffic.

## Important Points for the CCNA Exam

- Know what extra matching power extended ACLs provide.
- Be able to explain why placement is usually closer to the source.
- Remember that sequence order still matters.

## Real World Example

An administrator may allow web traffic from one subnet to a server while blocking all other traffic from that same subnet. A standard ACL could not make that distinction, but an extended ACL can.

## Quick Review

- Extended ACLs are more specific than standard ACLs.
- They can match source, destination, protocol, and ports.
- Placement is often closer to the source.
- Order still controls the outcome.

## Key Terms

- Extended ACL
- Protocol match
- Port match
- Traffic filtering
- Source placement

## Mini Practice Questions

1. What can an extended ACL match that a standard ACL cannot?
2. Why are extended ACLs often placed near the source?
3. Does ACL order still matter in an extended ACL?$$,8,12,'https://www.youtube.com/watch?v=dUttKY_CNXE'),
    ($$5.6 Extended ACL Lab$$,$$extended-acl-lab$$,$$Practice applying an extended ACL to allow required traffic and block unwanted flows with more precision.$$,$$## Simple Explanation

An extended ACL lab shows how detailed traffic control works in practice. You choose the correct source, destination, and service details, apply the ACL, and test that only the intended traffic is allowed.

## Key Concepts

- Extended ACLs support precise filtering.
- Correct placement prevents unnecessary traffic from crossing the network.
- Verification must check both the intended permits and the intended denies.
- Small errors in protocol or port matching can completely change the result.

## Important Points for the CCNA Exam

- Extended ACL questions often test whether you chose the right match criteria.
- Verification is important because policy intent must be proven with traffic tests.
- Protocol and port details matter as much as source and destination addresses.

## Real World Example

A policy may be intended to allow HTTPS to a server but block other applications. If the wrong port is used in the ACL, legitimate web traffic can fail even though the network path itself is fine.

## Quick Review

- Match the right traffic details.
- Apply the ACL correctly.
- Test expected permit and deny cases.
- Troubleshoot protocol and port choices carefully.

## Key Terms

- Protocol field
- Port number
- Policy intent
- ACL verification

## Mini Practice Questions

1. Why are protocol and port details important in an extended ACL?
2. What is one common reason an extended ACL lab fails?
3. Why should traffic tests include both allowed and denied cases?$$,9,13,'https://www.youtube.com/watch?v=1cuMzWBrEYs'),
    ($$5.7 Port Security Fundamentals$$,$$port-security-fundamentals$$,$$Learn how switch port security limits which devices can use an access port.$$,$$## Simple Explanation

Port security is a Layer 2 security feature that restricts which MAC addresses are allowed on a switchport. This helps reduce risks such as unauthorized devices being plugged into open wall jacks.

For the CCNA, focus on the purpose of port security, the idea of limiting learned addresses, and how switchports react when a violation happens.

## Key Concepts

- Port security works on switch access ports.
- Allowed MAC addresses can be limited.
- Sticky learning can help remember permitted MAC addresses.
- Violations trigger protective actions.

## Important Points for the CCNA Exam

- Know that port security is a Layer 2 feature.
- Be able to explain why unauthorized devices are a risk.
- Understand that different violation modes affect switch behavior differently.

## Real World Example

In an office, one wall jack may be intended for one desktop only. Port security can help stop a user from connecting an unmanaged switch and adding many unknown devices to the network.

## Quick Review

- Port security limits device access on a switchport.
- MAC addresses can be restricted.
- Violations trigger a configured response.
- It helps control physical Layer 2 access.

## Key Terms

- Port security
- Sticky MAC
- Violation
- Access port
- Unauthorized device

## Mini Practice Questions

1. What does port security control on a switchport?
2. Why is port security useful in user access areas?
3. Is port security mainly a Layer 2 or Layer 3 feature?$$,10,11,'https://www.youtube.com/watch?v=sHN3jOJIido'),
    ($$5.7 DHCP Snooping Fundamentals$$,$$dhcp-snooping-fundamentals$$,$$Understand how DHCP snooping helps block rogue DHCP behavior and builds trusted lease information.$$,$$## Simple Explanation

DHCP snooping is a switch security feature that helps stop unauthorized DHCP servers from handing out bad address information. It also builds a binding table that other security features can use to validate traffic later.

For the CCNA, you should understand the difference between trusted and untrusted ports, and why DHCP snooping is important in user-access networks.

## Key Concepts

- DHCP snooping classifies ports as trusted or untrusted.
- Untrusted ports should not send rogue DHCP server responses.
- DHCP snooping builds a binding table.
- The binding table supports other Layer 2 security features.

## Important Points for the CCNA Exam

- Know the purpose of trusted and untrusted DHCP snooping ports.
- Be able to explain how DHCP snooping helps stop rogue DHCP activity.
- Remember that the binding table is important for later validation features.

## Real World Example

If a user connects a small router or hotspot that starts sending DHCP offers, DHCP snooping can prevent that device from acting like an unauthorized DHCP server on the LAN.

## Quick Review

- DHCP snooping helps block rogue DHCP servers.
- Ports are marked trusted or untrusted.
- A binding table is created.
- The feature protects user access VLANs.

## Key Terms

- DHCP snooping
- Trusted port
- Untrusted port
- Rogue DHCP server
- Binding table

## Mini Practice Questions

1. What problem does DHCP snooping help prevent?
2. What is the difference between a trusted and untrusted port?
3. Why is the binding table important?$$,11,11,'https://www.youtube.com/watch?v=qYYeg2kz1yE'),
    ($$5.7 DHCP Snooping Lab$$,$$dhcp-snooping-lab$$,$$Practice configuring trusted and untrusted ports and verifying DHCP snooping behavior on a switch.$$,$$## Simple Explanation

A DHCP snooping lab shows how the feature behaves when real DHCP messages cross the switch. You mark the correct uplinks as trusted, keep user-facing ports untrusted, and verify that legitimate clients still get leases while rogue behavior is blocked.

## Key Concepts

- Uplink or server-facing ports are often the trusted ports.
- User-facing ports are usually untrusted.
- Verification should confirm correct lease behavior and policy enforcement.
- Wrong trust settings can block legitimate DHCP traffic.

## Important Points for the CCNA Exam

- Trust placement is one of the main DHCP snooping skills to know.
- Verification matters because legitimate DHCP must still work.
- A good security feature is not useful if it breaks correct traffic unnecessarily.

## Real World Example

An engineer enables DHCP snooping but forgets to trust the uplink toward the real DHCP server. Clients stop receiving leases until the trust setting is corrected.

## Quick Review

- Identify the real DHCP path.
- Trust the correct uplink.
- Leave user ports untrusted.
- Verify that clients still get valid leases.

## Key Terms

- Trust state
- Uplink
- Lease verification
- Policy enforcement

## Mini Practice Questions

1. Which ports are usually trusted in a DHCP snooping design?
2. What happens if the uplink to the real DHCP server is left untrusted?
3. Why is verification important after enabling DHCP snooping?$$,12,13,'https://www.youtube.com/watch?v=YMom_e545H4'),
    ($$5.7 Dynamic ARP Inspection$$,$$dynamic-arp-inspection$$,$$Understand how Dynamic ARP Inspection uses trusted information to stop ARP spoofing on the LAN.$$,$$## Simple Explanation

Dynamic ARP Inspection, or DAI, helps protect the LAN from false ARP messages. It works with DHCP snooping information to check whether ARP claims are believable. If an ARP message looks wrong, the switch can drop it instead of letting the bad information spread.

For the CCNA, the key idea is that DAI strengthens Layer 2 security by validating ARP behavior rather than trusting every ARP reply automatically.

## Key Concepts

- DAI stands for Dynamic ARP Inspection.
- ARP spoofing can redirect or intercept traffic.
- DAI uses trusted information to validate ARP messages.
- DHCP snooping bindings often support DAI decisions.

## Important Points for the CCNA Exam

- Know that DAI helps stop ARP spoofing.
- Understand that DAI and DHCP snooping are related features.
- Be able to explain why ARP validation matters on user-access networks.

## Real World Example

An attacker may try to poison ARP tables by claiming to be the default gateway. DAI helps stop those false ARP messages so user traffic is not redirected to the wrong device.

## Quick Review

- DAI validates ARP behavior.
- It helps block ARP spoofing.
- DHCP snooping information supports it.
- DAI is a Layer 2 protection feature.

## Key Terms

- DAI
- Dynamic ARP Inspection
- ARP spoofing
- Validation
- Binding table

## Mini Practice Questions

1. What attack does Dynamic ARP Inspection help prevent?
2. Which related security feature often provides trusted data for DAI?
3. Why is ARP validation important on access networks?$$,13,11,'https://www.youtube.com/watch?v=qYYeg2kz1yE'),
    ($$5.8 AAA Concepts$$,$$aaa-concepts$$,$$Compare authentication, authorization, and accounting and understand how each function supports secure access.$$,$$## Simple Explanation

AAA stands for authentication, authorization, and accounting. These three ideas help answer three different questions: who are you, what are you allowed to do, and what actions should be recorded. Together, they create a structured way to control and track access.

For the CCNA, focus on the role of each part of AAA and why separating identity, permission, and logging leads to better security and operations.

## Key Concepts

- Authentication confirms identity.
- Authorization decides what the user can do.
- Accounting records activity.
- AAA improves control and visibility for management access.

## Important Points for the CCNA Exam

- Be able to define all three AAA terms clearly.
- Know that authentication and authorization are not the same thing.
- Understand why accounting is useful for auditing and troubleshooting.

## Real World Example

An administrator may log into a router with valid credentials, receive limited commands based on role, and have all actions recorded for later review. That is AAA in practice.

## Quick Review

- Authentication means identity.
- Authorization means permission.
- Accounting means logging activity.
- AAA improves management control.

## Key Terms

- AAA
- Authentication
- Authorization
- Accounting
- Audit trail

## Mini Practice Questions

1. Which part of AAA decides what a user is allowed to do?
2. What part of AAA records actions for later review?
3. Why is AAA useful for network management?$$,14,10,'https://www.youtube.com/watch?v=VvFuieyTTSw'),
    ($$5.9 Wireless Security Protocols$$,$$wireless-security-protocols$$,$$Understand the purpose and differences of WPA, WPA2, and WPA3 in wireless networks.$$,$$## Simple Explanation

Wireless networks need security because anyone nearby may be able to receive the radio signal. Wireless security protocols protect access to the WLAN and help keep traffic confidential. Over time, security improved from weaker older methods to stronger modern options such as WPA2 and WPA3.

For the CCNA, focus on the role of WPA, WPA2, and WPA3, and know that stronger modern standards are preferred because older methods are weaker and less trustworthy.

## Key Concepts

- Wireless security protects access and traffic confidentiality.
- WPA improved on earlier weak security methods.
- WPA2 became a common enterprise standard.
- WPA3 adds stronger modern improvements.
- Strong wireless security reduces unauthorized access risk.

## Important Points for the CCNA Exam

- Know the difference in strength between older and newer WLAN security methods.
- Be able to identify WPA2 and WPA3 as important modern protocols.
- Understand why wireless security matters more than simply hiding the SSID.

## Real World Example

A business WLAN may require WPA2 or WPA3 so users must authenticate properly before joining the network, while traffic remains protected from casual eavesdropping.

## Quick Review

- Wireless security protects WLAN access and data.
- WPA2 and WPA3 are stronger modern choices.
- Better protocols reduce risk.
- Wireless protection matters because radio traffic can be received by nearby devices.

## Key Terms

- WPA
- WPA2
- WPA3
- Wireless security
- Confidentiality

## Mini Practice Questions

1. Why does a WLAN need security protection?
2. Which protocols are common modern wireless security choices?
3. Is hiding the SSID enough to secure a wireless network?$$,15,11,'https://www.youtube.com/watch?v=wHXKo9So5y8'),
    ($$5.10 WLAN Configuration with WPA2 PSK$$,$$wlan-configuration-with-wpa2-psk$$,$$Learn the GUI-based workflow for creating a WLAN and protecting it with WPA2 pre-shared key security.$$,$$## Simple Explanation

Many wireless platforms allow administrators to create and manage WLANs through a graphical interface. In a basic CCNA-level setup, one common task is building a WLAN and protecting it with WPA2 PSK so clients can authenticate with a shared passphrase.

For the CCNA, focus on the overall workflow: create the WLAN, choose the SSID, apply WPA2 PSK security, and verify that clients can connect successfully.

## Key Concepts

- A WLAN is the wireless network definition presented to users.
- WPA2 PSK uses a shared passphrase for authentication.
- GUI-based configuration is common on modern wireless systems.
- Verification should confirm both security settings and client connectivity.

## Important Points for the CCNA Exam

- Know that WPA2 PSK is a shared-key wireless security method.
- Be able to explain the basic setup sequence for a WLAN.
- Remember that configuration is not complete until client connectivity is verified.

## Real World Example

An administrator may create a staff WLAN called `Corp-Users`, assign WPA2 PSK security, and then test with a laptop to make sure users can join with the correct passphrase.

## Quick Review

- Create the WLAN.
- Assign the SSID.
- Apply WPA2 PSK.
- Verify client connection.

## Key Terms

- WLAN
- SSID
- WPA2 PSK
- Passphrase
- GUI configuration

## Mini Practice Questions

1. What does WPA2 PSK use to authenticate clients?
2. What is one important verification step after creating a WLAN?
3. Is creating the SSID alone enough to finish the WLAN configuration?$$,16,12,'https://www.youtube.com/watch?v=r9o6GFI87go'),
    ($$5.10 Wireless LANs Lab$$,$$wireless-lans-lab$$,$$Practice configuring and verifying a WLAN in the GUI so clients can join securely with WPA2 PSK.$$,$$## Simple Explanation

A wireless LAN lab gives you hands-on experience with the full workflow of WLAN creation and verification. You configure the WLAN in the GUI, apply WPA2 PSK settings, and check that a client can join successfully with the right security information.

## Key Concepts

- WLAN labs combine configuration and verification.
- Security settings must match what the client expects.
- SSID, passphrase, and policy details all affect success.
- Verification should confirm both association and usable connectivity.

## Important Points for the CCNA Exam

- GUI wireless labs often test small configuration mismatches.
- A client may see the SSID but still fail to authenticate if the security settings are wrong.
- Verification should include both successful join behavior and real connectivity testing.

## Real World Example

An engineer may create a new guest WLAN that appears correctly on user devices, but no one can join until the WPA2 PSK value is corrected. Lab practice builds the habit of verifying every part of that workflow.

## Quick Review

- Build the WLAN in the GUI.
- Apply the correct security settings.
- Verify client association.
- Test usable connectivity after the join succeeds.

## Key Terms

- Client association
- Authentication mismatch
- WLAN verification
- Wireless GUI workflow

## Mini Practice Questions

1. Why can a client see an SSID but still fail to join?
2. What should be tested after successful association to the WLAN?
3. Why are wireless GUI labs useful for the CCNA?$$,17,13,'https://www.youtube.com/watch?v=Il8ev78fcqw')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'security-fundamentals'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'secure-device-management'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'security-fundamentals'
  and lab.slug = 'harden-device-access-with-ssh-and-acls';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'secure-device-management'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'security-fundamentals'
  and challenge.slug = 'harden-remote-access-with-ssh';

-- Module 6: Automation and Programmability full curriculum

update public.modules
set
  title = 'Automation and Programmability',
  description = 'Automation concepts, controller-based networking, SDN architecture, and API fundamentals for CCNA.',
  order_index = 6,
  is_published = true
where slug = 'automation-and-programmability'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'automation-and-programmability'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$6.1 Automation and Network Management$$,$$automation-and-network-management$$,$$Understand how automation improves consistency, speed, and visibility in modern network operations.$$,$$## Simple Explanation

Automation helps network teams do repeated work in a more consistent way. Instead of logging in to every device and typing the same commands again and again, engineers can use repeatable workflows to collect data, check configurations, and make controlled changes faster.

For the CCNA, the key idea is not advanced scripting. It is understanding why automation matters to network management. Automation reduces manual effort, lowers the chance of human error, and makes it easier to handle large numbers of devices.

## Key Concepts

- Automation reduces repeated manual tasks.
- Consistency is one of the biggest benefits of automation.
- Automation can improve speed, accuracy, and visibility.
- Repeatable workflows help reduce configuration drift.
- Automation is useful for both data collection and configuration tasks.

## Important Points for the CCNA Exam

- Know why automation helps network operations.
- Be able to connect automation to efficiency and consistency.
- Understand that automation does not remove the need for verification.

## Real World Example

An engineer may need to check the interface status of fifty branch routers. A manual workflow takes time and increases the risk of missed details. An automated workflow can gather the same facts from all routers in a repeatable way.

## Quick Review

- Automation helps with repeated tasks.
- It improves consistency and speed.
- It reduces human error.
- Verification is still important after automation runs.

## Key Terms

- Automation
- Repeatable workflow
- Configuration drift
- Operational efficiency
- Consistency

## Mini Practice Questions

1. What is one major benefit of automation in network management?
2. Does automation remove the need for verification?
3. Why is consistency important in large networks?$$,1,11,'https://www.youtube.com/watch?v=4tsBgMCPVuc'),
    ($$6.2 Traditional Networks vs Controller-Based Networking$$,$$describe-controller-based-networking$$,$$Compare device-by-device administration with controller-based networking models.$$,$$## Simple Explanation

Traditional networks are usually managed one device at a time. Engineers log into routers, switches, and firewalls individually to configure or verify them. Controller-based networking changes that model by moving much of the policy and management logic into a central platform.

For the CCNA, you should understand the high-level difference between these two approaches. Traditional networks rely more on per-device configuration, while controller-based networks focus more on centralized policy, visibility, and automation.

## Key Concepts

- Traditional networks often use per-device CLI management.
- Controller-based networks centralize policy and management logic.
- Controllers can simplify large-scale changes.
- Centralization can improve consistency across many devices.
- Device state still matters even in controller-based designs.

## Important Points for the CCNA Exam

- Know the basic difference between traditional and controller-based management.
- Be able to explain why controller-based networking helps at scale.
- Understand that controllers do not remove the need for operational validation.

## Real World Example

In a traditional branch rollout, an engineer may configure each switch manually. In a controller-based design, the policy can be defined once and pushed consistently to many devices from a central system.

## Quick Review

- Traditional networks are often managed device by device.
- Controller-based networking centralizes policy.
- Centralization supports scale and consistency.
- Validation is still needed after changes.

## Key Terms

- Traditional networking
- Controller-based networking
- Centralized policy
- Per-device CLI
- Scale

## Mini Practice Questions

1. What is a key difference between traditional and controller-based networking?
2. Why do controllers help in larger environments?
3. Does centralized management remove the need to verify device state?$$,2,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Controller-Based Architecture: Overlay, Underlay, and Fabric$$,$$controller-based-architecture-overlay-underlay-and-fabric$$,$$Learn the main SDN architecture ideas behind overlay, underlay, and fabric designs.$$,$$## Simple Explanation

Controller-based and software-defined networks are often described with terms such as overlay, underlay, and fabric. The underlay is the real transport network that carries traffic. The overlay is the logical network built on top of that transport. A fabric is the overall system that ties these parts together and lets the network behave in a more unified way.

For the CCNA, focus on the purpose of these terms rather than deep product details. You should be able to explain that controller-based designs separate the physical transport from the logical services built on top of it.

## Key Concepts

- The underlay is the physical or transport network.
- The overlay is the logical network built on top of the underlay.
- A fabric is the coordinated architecture that ties the system together.
- Overlay designs help abstract services from the physical path.
- Controller-based networks use these ideas to simplify operations and scale.

## Important Points for the CCNA Exam

- Know the basic difference between overlay and underlay.
- Be able to explain fabric at a high level.
- Focus on architecture purpose, not deep implementation details.

## Real World Example

An enterprise may run a stable IP underlay between switches and routers while an overlay provides the logical segmentation and policy behavior seen by users and applications.

## Quick Review

- Underlay is the transport network.
- Overlay is the logical network on top.
- Fabric ties the architecture together.
- These ideas support scalable controller-based design.

## Key Terms

- Overlay
- Underlay
- Fabric
- SDN architecture
- Logical network

## Mini Practice Questions

1. What is the underlay in a controller-based design?
2. What does the overlay provide?
3. Why is the fabric concept useful in SDN discussions?$$,3,12,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Separation of Control Plane and Data Plane$$,$$separation-of-control-plane-and-data-plane$$,$$Understand why software-defined networking separates decision-making from packet forwarding.$$,$$## Simple Explanation

In traditional devices, the same box often makes forwarding decisions and also forwards the traffic. In software-defined networking, those roles are more clearly separated. The control plane makes decisions about where traffic should go, while the data plane actually forwards the packets.

For the CCNA, this is one of the most important SDN ideas. Separating control and forwarding helps networks become more programmable, easier to manage centrally, and more flexible when policy changes are needed.

## Key Concepts

- The control plane decides how traffic should be handled.
- The data plane forwards the actual packets.
- SDN separates these functions more clearly than many traditional designs.
- Separation supports central policy and programmability.

## Important Points for the CCNA Exam

- Know the difference between control plane and data plane.
- Be able to explain why SDN separates them.
- Understand that central control does not mean packets stop flowing through the actual network devices.

## Real World Example

A controller may define forwarding policy for a group of devices, but the switches still perform the actual packet forwarding in the data plane on the network path.

## Quick Review

- Control plane makes decisions.
- Data plane forwards traffic.
- SDN separates these roles more clearly.
- Separation supports central management and programmability.

## Key Terms

- Control plane
- Data plane
- SDN
- Central policy
- Forwarding decision

## Mini Practice Questions

1. What is the role of the control plane?
2. What is the role of the data plane?
3. Why is separating them useful in SDN?$$,4,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Northbound and Southbound APIs$$,$$northbound-and-southbound-apis$$,$$Understand how northbound and southbound APIs connect controllers, applications, and network devices.$$,$$## Simple Explanation

APIs are the communication methods that let software components exchange information and instructions. In controller-based networking, northbound APIs usually connect the controller to higher-level applications, while southbound APIs connect the controller to the devices or systems it manages.

For the CCNA, the main goal is to understand the direction and purpose of these APIs. Northbound APIs help applications talk to the controller. Southbound APIs help the controller communicate downward to the network infrastructure.

## Key Concepts

- API stands for Application Programming Interface.
- Northbound APIs connect controllers to higher-level systems or applications.
- Southbound APIs connect controllers to network devices or lower-level systems.
- APIs help automation and programmability work at scale.
- Direction matters because each API type serves a different role.

## Important Points for the CCNA Exam

- Know the difference between northbound and southbound APIs.
- Be able to explain how APIs fit into controller-based networking.
- Understand that APIs help software exchange structured requests and responses.

## Real World Example

An automation platform may use a northbound API to ask a controller for network inventory, while the controller uses southbound communication to apply policy or gather state from the devices under its control.

## Quick Review

- APIs let software communicate.
- Northbound means toward applications.
- Southbound means toward devices or lower layers.
- APIs are a major part of controller-based networking.

## Key Terms

- API
- Northbound API
- Southbound API
- Controller
- Structured response

## Mini Practice Questions

1. What does a northbound API usually connect to?
2. What does a southbound API usually connect to?
3. Why are APIs important in controller-based networking?$$,5,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 REST APIs and Automation Workflows$$,$$apis-json-and-automation-workflows$$,$$Use REST API ideas and structured data concepts to understand how controllers and automation tools exchange information.$$,$$## Simple Explanation

REST APIs are a common way software systems exchange data. In networking, they are often used so controllers, tools, and scripts can request information or submit changes in a structured format. This makes automation more consistent than copying information manually from device to device.

For the CCNA, focus on the high-level idea that REST APIs support automation by providing machine-readable communication between systems. You do not need deep programming knowledge, but you should know why structured API workflows are useful.

## Key Concepts

- REST APIs are widely used for automation and data exchange.
- Structured data formats make responses easier for software to read.
- API-driven workflows support repeatable operations.
- Controllers often expose information that automation tools can consume.

## Important Points for the CCNA Exam

- Know that REST APIs support automation and programmability.
- Be able to connect APIs to structured, repeatable workflows.
- Understand that API use improves scale compared with manual collection.

## Real World Example

Instead of logging into dozens of devices to copy interface information by hand, an engineer may query a controller API and receive structured results that can be checked automatically.

## Quick Review

- REST APIs help systems exchange information.
- Structured data supports automation.
- API workflows are repeatable and scalable.
- Automation tools often depend on APIs for data collection.

## Key Terms

- REST API
- Structured data
- Automation workflow
- Machine-readable response
- Controller inventory

## Mini Practice Questions

1. Why are REST APIs useful in network automation?
2. What is one advantage of machine-readable responses?
3. How do API workflows improve scale compared with manual collection?$$,6,12,'https://www.youtube.com/watch?v=Luei0p-2h10')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'automation-and-programmability'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'describe-controller-based-networking'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'automation-and-programmability'
  and lab.slug = 'validate-controller-data-and-device-inventory';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'describe-controller-based-networking'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'automation-and-programmability'
  and challenge.slug = 'collect-device-facts-for-automation-readiness';

-- Phase 34: Community foundation
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_role text not null default 'learner'
    check (author_role in ('learner', 'tutor')),
  subject text not null check (length(trim(subject)) > 0),
  topic text not null default 'general'
    check (
      topic in (
        'general',
        'lesson_help',
        'subnetting',
        'routing',
        'switching',
        'wireless',
        'labs'
      )
    ),
  message_body text not null check (length(trim(message_body)) > 0),
  lesson_id uuid null references public.lessons(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  community_post_id uuid not null references public.community_posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_role text not null default 'learner'
    check (author_role in ('learner', 'tutor')),
  message_body text not null check (length(trim(message_body)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_community_posts_author_user_id
  on public.community_posts(author_user_id);

create index if not exists idx_community_posts_topic
  on public.community_posts(topic);

create index if not exists idx_community_posts_lesson_id
  on public.community_posts(lesson_id);

create index if not exists idx_community_posts_updated_at
  on public.community_posts(updated_at desc);

create index if not exists idx_community_replies_post_id
  on public.community_replies(community_post_id);

create index if not exists idx_community_replies_author_user_id
  on public.community_replies(author_user_id);

create index if not exists idx_community_replies_created_at
  on public.community_replies(created_at);

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
before update on public.community_posts
for each row
execute function public.set_updated_at_timestamp();

create or replace function public.touch_community_post_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set updated_at = timezone('utc', now())
  where id = new.community_post_id;

  return new;
end;
$$;

drop trigger if exists trg_community_posts_touch_from_reply on public.community_replies;
create trigger trg_community_posts_touch_from_reply
after insert on public.community_replies
for each row
execute function public.touch_community_post_updated_at();

alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

drop policy if exists "community_posts_select_authenticated" on public.community_posts;
create policy "community_posts_select_authenticated"
on public.community_posts
for select
to authenticated
using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (auth.uid() = author_user_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts
for update
to authenticated
using (auth.uid() = author_user_id)
with check (auth.uid() = author_user_id);

drop policy if exists "community_replies_select_authenticated" on public.community_replies;
create policy "community_replies_select_authenticated"
on public.community_replies
for select
to authenticated
using (true);

drop policy if exists "community_replies_insert_own" on public.community_replies;
create policy "community_replies_insert_own"
on public.community_replies
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and exists (
    select 1
    from public.community_posts cp
    where cp.id = community_replies.community_post_id
  )
);

grant select, insert, update on public.community_posts to authenticated;
grant select, insert on public.community_replies to authenticated;

-- ==============================
-- Phase 35: RLS hardening for learner-owned, billing, and community data
-- Source: supabase\migrations\20260323_phase35_rls_hardening.sql
-- ==============================
drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
on public.user_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons l
    where l.id = user_progress.lesson_id
      and l.is_published = true
  )
);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons l
    where l.id = user_progress.lesson_id
      and l.is_published = true
  )
);

drop policy if exists "lab_progress_insert_own" on public.lab_progress;
create policy "lab_progress_insert_own"
on public.lab_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.labs l
    where l.id = lab_progress.lab_id
      and l.is_published = true
  )
);

drop policy if exists "lab_progress_update_own" on public.lab_progress;
create policy "lab_progress_update_own"
on public.lab_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.labs l
    where l.id = lab_progress.lab_id
      and l.is_published = true
  )
);

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.quizzes q
    where q.id = quiz_attempts.quiz_id
      and q.is_published = true
  )
);

drop policy if exists "exam_attempts_insert_own" on public.exam_attempts;
create policy "exam_attempts_insert_own"
on public.exam_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exam_configs ec
    where ec.id = exam_attempts.exam_config_id
      and ec.is_published = true
  )
);

drop policy if exists "support_requests_insert_own" on public.support_requests;
create policy "support_requests_insert_own"
on public.support_requests
for insert
to authenticated
with check (
  auth.uid() = learner_user_id
  and (
    tutor_profile_id is null
    or exists (
      select 1
      from public.tutor_profiles tp
      where tp.id = support_requests.tutor_profile_id
        and tp.is_active = true
    )
  )
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = support_requests.lesson_id
        and l.is_published = true
    )
  )
  and (
    quiz_attempt_id is null
    or exists (
      select 1
      from public.quiz_attempts qa
      where qa.id = support_requests.quiz_attempt_id
        and qa.user_id = auth.uid()
    )
  )
  and (
    exam_attempt_id is null
    or exists (
      select 1
      from public.exam_attempts ea
      where ea.id = support_requests.exam_attempt_id
        and ea.user_id = auth.uid()
    )
  )
  and (
    lab_id is null
    or exists (
      select 1
      from public.labs l
      where l.id = support_requests.lab_id
        and l.is_published = true
    )
  )
  and (
    cli_challenge_id is null
    or exists (
      select 1
      from public.cli_challenges challenge
      where challenge.id = support_requests.cli_challenge_id
        and challenge.is_published = true
    )
  )
);

drop policy if exists "user_subscriptions_insert_own" on public.user_subscriptions;
drop policy if exists "user_subscriptions_update_own" on public.user_subscriptions;
revoke insert, update on public.user_subscriptions from authenticated;
grant select on public.user_subscriptions to authenticated;

drop policy if exists "payment_events_select_own_or_unbound" on public.payment_events;
drop policy if exists "payment_events_select_own" on public.payment_events;
drop policy if exists "payment_events_insert_own_or_unbound" on public.payment_events;
drop policy if exists "payment_events_insert_own" on public.payment_events;
revoke select, insert on public.payment_events from authenticated;

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = community_posts.lesson_id
        and l.is_published = true
    )
  )
);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts
for update
to authenticated
using (auth.uid() = author_user_id)
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and (
    lesson_id is null
    or exists (
      select 1
      from public.lessons l
      where l.id = community_posts.lesson_id
        and l.is_published = true
    )
  )
);

drop policy if exists "community_replies_insert_own" on public.community_replies;
create policy "community_replies_insert_own"
on public.community_replies
for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and author_role = case
    when public.current_app_role() = 'tutor' then 'tutor'
    else 'learner'
  end
  and exists (
    select 1
    from public.community_posts cp
    where cp.id = community_replies.community_post_id
  )
);

drop policy if exists "lab_storage_select_authenticated" on storage.objects;
drop policy if exists "lab_storage_select_published_lab_files" on storage.objects;

revoke execute on function public.get_app_role(uuid) from public, anon, authenticated;
revoke execute on function public.current_app_role() from public, anon;
grant execute on function public.current_app_role() to authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.current_active_tutor_profile_id() from public, anon;
grant execute on function public.current_active_tutor_profile_id() to authenticated;
revoke execute on function public.is_tutor() from public, anon;
grant execute on function public.is_tutor() to authenticated;

revoke execute on function public.handle_new_user_role() from public, anon, authenticated;
revoke execute on function public.sync_user_role_for_tutor_profile(uuid) from public, anon, authenticated;
revoke execute on function public.handle_tutor_profile_role_sync() from public, anon, authenticated;
revoke execute on function public.insert_notification_record(uuid, text, text, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.validate_tutor_session_followup_write() from public, anon, authenticated;
revoke execute on function public.handle_tutor_session_notifications() from public, anon, authenticated;
revoke execute on function public.handle_tutor_session_followup_notifications() from public, anon, authenticated;
revoke execute on function public.enqueue_notification_delivery_record() from public, anon, authenticated;
revoke execute on function public.upsert_scheduled_job(uuid, text, text, uuid, timestamptz, jsonb, text) from public, anon, authenticated;
revoke execute on function public.cancel_pending_jobs_for_entity(uuid, text, uuid, text) from public, anon, authenticated;
revoke execute on function public.schedule_tutor_session_reminders(uuid) from public, anon, authenticated;
revoke execute on function public.seed_default_notification_preferences(uuid) from public, anon, authenticated;
revoke execute on function public.handle_notification_preferences_for_new_user() from public, anon, authenticated;
revoke execute on function public.notification_channel_enabled(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.claim_due_scheduled_jobs(uuid, integer, integer) from public, anon, authenticated;
revoke execute on function public.claim_due_notification_deliveries(uuid, integer, integer) from public, anon, authenticated;
revoke execute on function public.touch_community_post_updated_at() from public, anon, authenticated;

-- ==============================
-- Phase 36: Billing checkout RPCs for authenticated finalization
-- ==============================

create or replace function public.record_billing_payment_event(
  p_target_user_id uuid,
  p_event_provider text,
  p_event_type text,
  p_event_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_target_user_id then
    raise exception 'Unauthorized billing event write.';
  end if;

  begin
    insert into public.payment_events (
      user_id,
      provider,
      event_type,
      event_payload
    )
    values (
      p_target_user_id,
      p_event_provider,
      p_event_type,
      coalesce(p_event_payload, '{}'::jsonb)
    );
  exception
    when unique_violation then
      null;
  end;
end;
$$;

create or replace function public.finalize_billing_checkout(
  p_target_user_id uuid,
  p_plan_slug text,
  p_provider text,
  p_provider_customer_id text,
  p_provider_subscription_id text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_payment_event_type text,
  p_payment_event_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_existing_subscription_id uuid;
  v_existing_subscription_user_id uuid;
  v_subscription_id uuid;
begin
  if auth.uid() is distinct from p_target_user_id then
    raise exception 'Unauthorized billing checkout finalization.';
  end if;

  select id
  into v_plan_id
  from public.plans
  where slug = p_plan_slug
    and is_active = true
  limit 1;

  if v_plan_id is null or p_plan_slug = 'free' then
    raise exception 'Selected billing plan is invalid for checkout finalization.';
  end if;

  if p_provider not in ('dev_checkout', 'stripe') then
    raise exception 'Unsupported billing provider: %', p_provider;
  end if;

  select id, user_id
  into v_existing_subscription_id, v_existing_subscription_user_id
  from public.user_subscriptions
  where provider_subscription_id = p_provider_subscription_id
  limit 1;

  if found and v_existing_subscription_user_id is distinct from p_target_user_id then
    raise exception 'This checkout subscription already belongs to a different user.';
  end if;

  update public.user_subscriptions
  set status = 'expired'
  where user_id = p_target_user_id
    and status in ('active', 'trialing', 'past_due')
    and (
      p_provider_subscription_id is null
      or provider_subscription_id <> p_provider_subscription_id
    );

  if v_existing_subscription_id is not null then
    update public.user_subscriptions
    set
      user_id = p_target_user_id,
      plan_id = v_plan_id,
      status = 'active',
      provider = p_provider,
      provider_customer_id = p_provider_customer_id,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      updated_at = timezone('utc', now())
    where id = v_existing_subscription_id
    returning id into v_subscription_id;
  else
    insert into public.user_subscriptions (
      user_id,
      plan_id,
      status,
      provider,
      provider_customer_id,
      provider_subscription_id,
      current_period_start,
      current_period_end
    )
    values (
      p_target_user_id,
      v_plan_id,
      'active',
      p_provider,
      p_provider_customer_id,
      p_provider_subscription_id,
      p_current_period_start,
      p_current_period_end
    )
    returning id into v_subscription_id;
  end if;

  begin
    insert into public.payment_events (
      user_id,
      provider,
      event_type,
      event_payload
    )
    values (
      p_target_user_id,
      p_provider,
      p_payment_event_type,
      coalesce(p_payment_event_payload, '{}'::jsonb)
    );
  exception
    when unique_violation then
      null;
  end;

  return v_subscription_id;
end;
$$;

revoke execute on function public.record_billing_payment_event(uuid, text, text, jsonb) from public, anon;
grant execute on function public.record_billing_payment_event(uuid, text, text, jsonb) to authenticated;

revoke execute on function public.finalize_billing_checkout(uuid, text, text, text, text, timestamptz, timestamptz, text, jsonb) from public, anon;
grant execute on function public.finalize_billing_checkout(uuid, text, text, text, text, timestamptz, timestamptz, text, jsonb) to authenticated;

