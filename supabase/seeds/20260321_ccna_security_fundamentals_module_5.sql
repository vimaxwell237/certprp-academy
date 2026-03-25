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
