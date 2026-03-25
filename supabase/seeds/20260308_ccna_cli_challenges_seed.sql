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
      'vlan-configuration-and-verification',
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
