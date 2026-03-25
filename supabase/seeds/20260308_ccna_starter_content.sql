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
and slug in ('osi-and-tcpip-models', 'ipv4-ipv6-addressing-basics');

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
