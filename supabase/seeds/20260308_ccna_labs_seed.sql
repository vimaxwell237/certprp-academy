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
      'vlan-practice-lab',
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
