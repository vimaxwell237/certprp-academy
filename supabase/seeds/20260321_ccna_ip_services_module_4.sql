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
