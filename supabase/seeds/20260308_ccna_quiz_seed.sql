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

