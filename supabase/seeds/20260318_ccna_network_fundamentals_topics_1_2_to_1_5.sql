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
