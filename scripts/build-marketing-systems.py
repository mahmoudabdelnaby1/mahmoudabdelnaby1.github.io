from __future__ import annotations

import html
import json
from pathlib import Path
import re
import shutil


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mahmoudabdelnaby1.github.io"
GITHUB = "https://github.com/mahmoudabdelnaby1/mahmoudabdelnaby1.github.io"


ALL_ITEMS = [
    {
        "slug": "meta-ads-reporting-reconciliation", "kind": "Workflow", "kind_ar": "سير عمل",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "Meta Ads Reporting Reconciliation", "title_ar": "مراجعة تقارير Meta Ads ومطابقتها",
        "summary": "Reconcile Ads Manager labels with the underlying events and business records before explaining a reporting change.",
        "summary_ar": "طابق مسميات Ads Manager مع الأحداث وسجلات النشاط التجاري قبل تفسير أي تغيير في التقرير.",
        "task": "Use this workflow when a Meta Ads report appears to change after a platform update or when the reported conversion count does not match the business system.",
        "task_ar": "استخدم سير العمل عندما يتغير تقرير Meta Ads بعد تحديث، أو عندما لا يطابق عدد التحويلات سجلات النشاط التجاري.",
        "inputs": "Date range and timezone; attribution setting; event definitions; Ads Manager export; order or CRM records; change log.",
        "inputs_ar": "الفترة الزمنية والمنطقة؛ إعداد الإسناد؛ تعريف الأحداث؛ تصدير Ads Manager؛ سجلات الطلبات أو CRM؛ سجل التغييرات.",
        "steps": ["Freeze the reporting window, timezone, and attribution settings.", "Map each platform metric to its event definition and source system.", "Compare platform totals with deduplicated orders or qualified CRM outcomes.", "Separate confirmed changes from timing, consent, and attribution differences.", "Write a client note with the affected metric, evidence, and next check."],
        "steps_ar": ["ثبّت الفترة والمنطقة الزمنية وإعدادات الإسناد.", "اربط كل مقياس في المنصة بتعريف الحدث ومصدره.", "قارن إجماليات المنصة بالطلبات بعد إزالة التكرار أو بنتائج CRM المؤهلة.", "افصل التغييرات المؤكدة عن فروق التوقيت والموافقة والإسناد.", "اكتب ملاحظة توضح المقياس المتأثر والدليل وخطوة التحقق التالية."],
        "output": "A metric map, reconciliation table, and evidence-based explanation of the variance.",
        "output_ar": "خريطة للمقاييس وجدول مطابقة وتفسير للفروق مدعوم بالأدلة.",
        "limits": "Platform reporting is not proof of attributed revenue. Confirm current Meta definitions and reconcile against business records.",
        "limits_ar": "تقرير المنصة لا يثبت الإيراد المنسوب. تحقّق من تعريفات Meta الحالية وطابقها مع سجلات النشاط التجاري.",
    },
    {
        "slug": "paid-media-reporting-dashboard-spec", "kind": "Project specification", "kind_ar": "مواصفات مشروع",
        "suite": "Analytics & reporting", "suite_ar": "التحليلات والتقارير",
        "title": "Paid Media Reporting Dashboard Specification", "title_ar": "مواصفات لوحة تقارير الإعلانات المدفوعة",
        "summary": "Define a reporting view that keeps platform delivery, tracked actions, and business outcomes visibly separate.",
        "summary_ar": "صمّم لوحة تفصل بوضوح بين تسليم المنصة والأحداث المقاسة والنتائج التجارية.",
        "task": "Use this specification before building an agency or client dashboard that combines ad-platform and first-party data.",
        "task_ar": "استخدم هذه المواصفات قبل بناء لوحة تجمع بيانات منصات الإعلان وبيانات النشاط التجاري.",
        "inputs": "Stakeholder questions; source systems; event dictionary; spend and revenue definitions; refresh cadence; access rules.",
        "inputs_ar": "أسئلة أصحاب المصلحة؛ الأنظمة المصدرية؛ قاموس الأحداث؛ تعريفات الإنفاق والإيراد؛ دورية التحديث؛ صلاحيات الوصول.",
        "steps": ["List decisions the dashboard must support; remove vanity metrics without a decision use.", "Define each metric, owner, source, timezone, and update cadence.", "Separate platform-attributed results from reconciled business outcomes.", "Specify filters, annotations, missing-data states, and access controls.", "Review sample screens against real reporting questions before implementation."],
        "steps_ar": ["حدّد القرارات التي ستدعمها اللوحة واحذف المقاييس التي لا تخدم قرارًا.", "عرّف كل مقياس ومصدره ومالكه ومنطقته الزمنية ودورية تحديثه.", "افصل نتائج إسناد المنصة عن نتائج النشاط التجاري بعد المطابقة.", "حدّد المرشحات والتعليقات وحالات البيانات الناقصة وضوابط الوصول.", "راجع الشاشات الأولية مقابل أسئلة التقارير الفعلية قبل التنفيذ."],
        "output": "A dashboard requirements brief with metric definitions, source map, and review checklist.",
        "output_ar": "موجز متطلبات لوحة يتضمن تعريفات المقاييس وخريطة المصادر وقائمة مراجعة.",
        "limits": "This is a documentation blueprint, not a working dashboard or a verified connector. Validate access, data quality, and platform terms before implementation.",
        "limits_ar": "هذه مواصفات توثيقية وليست لوحة عاملة أو تكاملًا متحققًا. راجع الصلاحيات وجودة البيانات وشروط المنصات قبل التنفيذ.",
    },
    {
        "slug": "ad-account-agent-access-guardrails", "kind": "Skill & checklist", "kind_ar": "مهارة وقائمة مراجعة",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "Ad Account Agent Access Guardrails", "title_ar": "ضوابط وصول الوكلاء إلى الحسابات الإعلانية",
        "summary": "Set a least-privilege, review-first process before connecting an AI agent to advertising workflows.",
        "summary_ar": "ضع عملية مراجعة وصلاحيات محدودة قبل ربط وكيل ذكاء اصطناعي بسير عمل إعلاني.",
        "task": "Use this checklist when evaluating an agent, integration, or automation that can view or change advertising data.",
        "task_ar": "استخدم القائمة عند تقييم وكيل أو تكامل أو أتمتة يمكنها الاطلاع على بيانات الإعلان أو تغييرها.",
        "inputs": "Requested permissions; account structure; data classification; approval owners; rollback procedure; vendor documentation.",
        "inputs_ar": "الصلاحيات المطلوبة؛ بنية الحساب؛ تصنيف البيانات؛ أصحاب الموافقة؛ إجراء التراجع؛ وثائق المزوّد.",
        "steps": ["Inventory read and write permissions separately.", "Remove permissions that are not needed for the specific task.", "Test on non-production data or a limited account where possible.", "Require a human preview and explicit approval for changes affecting spend, targeting, or publication.", "Log actions and define an owner, alert path, and rollback procedure."],
        "steps_ar": ["احصر صلاحيات القراءة والكتابة كلًا على حدة.", "أزل الصلاحيات غير اللازمة للمهمة المحددة.", "اختبر على بيانات غير إنتاجية أو حساب محدود متى أمكن.", "اشترط معاينة وموافقة بشرية صريحة للتغييرات التي تمس الإنفاق أو الاستهداف أو النشر.", "سجّل الإجراءات وحدد مسؤولًا ومسار تنبيه وخطة تراجع."],
        "output": "A permission matrix, pre-connection review, and approval record.",
        "output_ar": "مصفوفة صلاحيات ومراجعة قبل الربط وسجل للموافقات.",
        "limits": "These controls reduce operational risk; they cannot guarantee account approval or prevent platform restrictions. Recheck current platform and vendor requirements.",
        "limits_ar": "تقلل الضوابط المخاطر التشغيلية، لكنها لا تضمن قبول الحساب أو تمنع قيود المنصة. راجع متطلبات المنصة والمزوّد الحالية.",
    },
    {
        "slug": "ai-media-buying-review-copilot", "kind": "Agent instructions", "kind_ar": "تعليمات وكيل",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "AI Media Buying Review Copilot", "title_ar": "مساعد مراجعة قرارات شراء الوسائط بالذكاء الاصطناعي",
        "summary": "Structure campaign diagnosis and recommendations while keeping account changes under human control.",
        "summary_ar": "نظّم تشخيص الحملات والتوصيات مع إبقاء تغييرات الحساب تحت سيطرة الإنسان.",
        "task": "Use the prompt with campaign exports when you need a documented diagnosis, prioritized tests, or a second review of a proposed change.",
        "task_ar": "استخدم التعليمات مع تقارير الحملة للحصول على تشخيص موثق أو اختبارات مرتبة أو مراجعة ثانية لتغيير مقترح.",
        "inputs": "Campaign objective; date range; spend and outcome data; tracking notes; changes made; business constraints.",
        "inputs_ar": "هدف الحملة؛ الفترة؛ بيانات الإنفاق والنتائج؛ ملاحظات القياس؛ التغييرات السابقة؛ قيود العمل.",
        "steps": ["Check data completeness and reporting definitions before interpreting performance.", "Ask for missing context rather than infer a cause from one metric.", "Rank hypotheses by evidence, impact, and reversibility.", "Propose a test with a baseline, success measure, and stop condition.", "Require a named human approver before any account write or publication."],
        "steps_ar": ["تحقق من اكتمال البيانات وتعريفات التقارير قبل تفسير الأداء.", "اطلب السياق الناقص بدل استنتاج السبب من مقياس واحد.", "رتّب الفرضيات حسب الدليل والأثر وإمكانية التراجع.", "اقترح اختبارًا بخط أساس ومقياس نجاح وشرط إيقاف.", "اشترط موافقة شخص محدد قبل أي كتابة في الحساب أو نشر."],
        "output": "A diagnosis with evidence, confidence, next test, and approval requirement.",
        "output_ar": "تشخيص يتضمن الأدلة ودرجة الثقة والاختبار التالي ومتطلب الموافقة.",
        "limits": "An AI recommendation is not account access, platform truth, or a performance guarantee. Verify data and current platform guidance.",
        "limits_ar": "توصية الذكاء الاصطناعي ليست وصولًا للحساب أو حقيقة من المنصة أو ضمانًا للأداء. تحقّق من البيانات والإرشادات الحالية.",
    },
    {
        "slug": "ad-account-restriction-response", "kind": "Review framework", "kind_ar": "إطار مراجعة",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "Ad Account Restriction Review & Response", "title_ar": "مراجعة قيود الحساب الإعلاني والاستجابة لها",
        "summary": "Organize evidence and next steps after an account or asset restriction without promising prevention or reinstatement.",
        "summary_ar": "نظّم الأدلة والخطوات التالية عند تقييد حساب أو أصل إعلاني دون وعد بالمنع أو الاستعادة.",
        "task": "Use this framework to document what changed, preserve evidence, and prepare an accurate platform review request.",
        "task_ar": "استخدم الإطار لتوثيق ما تغيّر وحفظ الأدلة وإعداد طلب مراجعة دقيق للمنصة.",
        "inputs": "Exact platform notice; affected asset IDs; account history; recent edits; policy text cited by the platform; supporting records.",
        "inputs_ar": "إشعار المنصة نصًا؛ معرّفات الأصول المتأثرة؛ سجل الحساب؛ التعديلات الأخيرة؛ نص السياسة المشار إليه؛ السجلات الداعمة.",
        "steps": ["Capture the notice, timestamp, affected assets, and current account state.", "Pause risky edits; preserve relevant records and campaign context.", "Compare the cited policy with the actual ad, destination, and account behavior.", "Separate confirmed facts from assumptions and identify a corrective action if needed.", "Submit a concise, accurate review request through the platform's official channel and track the response."],
        "steps_ar": ["احفظ الإشعار والتوقيت والأصول المتأثرة وحالة الحساب الحالية.", "أوقف التعديلات عالية المخاطر واحفظ السجلات وسياق الحملة.", "قارن السياسة المشار إليها بالإعلان والوجهة وسلوك الحساب الفعلي.", "افصل الحقائق المؤكدة عن الافتراضات وحدد إجراءً تصحيحيًا عند الحاجة.", "قدّم طلب مراجعة دقيقًا ومختصرًا عبر قناة المنصة الرسمية وتابع الرد."],
        "output": "An incident record, evidence checklist, and factual review-request draft.",
        "output_ar": "سجل واقعة وقائمة أدلة ومسودة طلب مراجعة واقعية.",
        "limits": "No checklist can make an account ban-proof or guarantee reinstatement. Follow official policy and appeal routes; do not disguise the underlying offer.",
        "limits_ar": "لا تجعل أي قائمة الحساب محصنًا من الحظر ولا تضمن استعادته. اتبع السياسات وقنوات الاعتراض الرسمية ولا تُخفِ حقيقة العرض.",
    },
    {
        "slug": "ga4-measurement-setup-workflow", "kind": "Setup skill", "kind_ar": "مهارة إعداد",
        "suite": "Analytics & reporting", "suite_ar": "التحليلات والتقارير",
        "title": "GA4 Measurement Setup Workflow", "title_ar": "سير إعداد القياس في GA4",
        "summary": "Plan a GA4 property, event map, and quality checks before relying on reports for decisions.",
        "summary_ar": "خطط لخاصية GA4 وخريطة الأحداث وفحوص الجودة قبل الاعتماد على التقارير في القرارات.",
        "task": "Use this workflow for a new GA4 implementation or a structured review of an existing measurement setup.",
        "task_ar": "استخدم سير العمل لإعداد GA4 جديد أو مراجعة منظمة لقياس قائم.",
        "inputs": "Business questions; site or app events; consent requirements; GTM plan; conversion definitions; test environment.",
        "inputs_ar": "أسئلة العمل؛ أحداث الموقع أو التطبيق؛ متطلبات الموافقة؛ خطة GTM؛ تعريفات التحويل؛ بيئة الاختبار.",
        "steps": ["Translate business questions into measurable events and parameters.", "Document naming, parameter types, consent behavior, and exclusions.", "Implement in a test environment and inspect event payloads.", "Validate key events and deduplication against the originating action.", "Record the owner, known gaps, and post-release monitoring plan."],
        "steps_ar": ["حوّل أسئلة العمل إلى أحداث ومعلمات قابلة للقياس.", "وثّق التسمية وأنواع المعلمات وسلوك الموافقة والاستثناءات.", "نفّذ في بيئة اختبار وافحص بيانات الأحداث.", "تحقق من الأحداث الرئيسية وإزالة التكرار مقابل الإجراء الأصلي.", "سجّل المسؤول والفجوات المعروفة وخطة المتابعة بعد النشر."],
        "output": "An event dictionary, implementation checklist, and QA record.",
        "output_ar": "قاموس أحداث وقائمة تنفيذ وسجل ضمان جودة.",
        "limits": "A checklist cannot confirm live receipt. Verify in the target GA4 property and respect consent, privacy, and retention requirements.",
        "limits_ar": "لا تثبت القائمة وصول البيانات فعليًا. تحقق داخل خاصية GA4 المستهدفة وراعِ الموافقة والخصوصية والاحتفاظ بالبيانات.",
    },
    {
        "slug": "google-ads-prelaunch-review", "kind": "Audit template", "kind_ar": "قالب تدقيق",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "Google Ads Pre-Launch Review", "title_ar": "مراجعة Google Ads قبل الإطلاق",
        "summary": "Check campaign intent, destination, conversion measurement, and approval status before launch.",
        "summary_ar": "راجع هدف الحملة والوجهة وقياس التحويلات وحالة الموافقات قبل الإطلاق.",
        "task": "Use the review for a new campaign, a major rebuild, or a handoff where the launch risks need to be visible.",
        "task_ar": "استخدم المراجعة لحملة جديدة أو إعادة بناء كبيرة أو تسليم يحتاج إلى إظهار مخاطر الإطلاق.",
        "inputs": "Approved brief; campaign structure; keyword or audience plan; ad copy; landing page; conversion actions; budget and dates.",
        "inputs_ar": "موجز معتمد؛ هيكل الحملة؛ خطة الكلمات أو الجمهور؛ نص الإعلان؛ صفحة الهبوط؛ إجراءات التحويل؛ الميزانية والتواريخ.",
        "steps": ["Confirm objective, geography, audience, and exclusions against the brief.", "Check naming, budget, schedule, targeting, and final URLs.", "Review ad claims, destination consistency, and policy-sensitive content.", "Test conversion actions and confirm the primary goal is appropriate for bidding.", "Record blockers, owners, approval, and the first post-launch review time."],
        "steps_ar": ["طابق الهدف والموقع والجمهور والاستثناءات مع الموجز.", "راجع التسمية والميزانية والجدول والاستهداف والروابط النهائية.", "راجع الادعاءات وتطابق الوجهة والمحتوى الحساس للسياسات.", "اختبر إجراءات التحويل وتأكد أن الهدف الأساسي مناسب للمزايدة.", "سجّل الموانع والمسؤولين والموافقة وموعد أول مراجعة بعد الإطلاق."],
        "output": "A launch decision record: ready, blocked, or ready with named risks.",
        "output_ar": "سجل قرار الإطلاق: جاهز أو متوقف أو جاهز مع مخاطر محددة ومسؤولين.",
        "limits": "A preflight review is not a policy approval or a promise of leads. Verify current Google Ads policies and account configuration.",
        "limits_ar": "مراجعة ما قبل الإطلاق ليست موافقة من السياسة ولا ضمانًا للعملاء المحتملين. تحقق من سياسات Google Ads وإعدادات الحساب الحالية.",
    },
    {
        "slug": "ecommerce-lifecycle-email-flow-library", "kind": "Flow templates", "kind_ar": "قوالب تدفقات",
        "suite": "Email & lifecycle", "suite_ar": "البريد الإلكتروني ودورة العميل",
        "title": "E-commerce Lifecycle Email Flow Library", "title_ar": "مكتبة تدفقات البريد لدورة عميل التجارة الإلكترونية",
        "summary": "Plan welcome, browse, cart, post-purchase, replenishment, review, VIP, and win-back flows around actual customer events.",
        "summary_ar": "خطط لتدفقات الترحيب والتصفح والسلة وما بعد الشراء وإعادة الطلب والتقييم والولاء والاستعادة بناءً على أحداث العميل الفعلية.",
        "task": "Use these flow briefs when mapping lifecycle messages in an email or CRM platform.",
        "task_ar": "استخدم موجزات التدفق عند تخطيط رسائل دورة العميل في منصة بريد أو CRM.",
        "inputs": "Event availability; consent and suppression rules; product cycle; audience segments; offer terms; support capacity.",
        "inputs_ar": "توفر الأحداث؛ قواعد الموافقة والاستبعاد؛ دورة المنتج؛ شرائح الجمهور؛ شروط العرض؛ قدرة الدعم.",
        "steps": ["Choose the customer event and confirm it is captured reliably.", "Define entry, exit, suppression, and timing rules.", "Write message purpose and content blocks before drafting copy.", "Add a control group or measurement plan where appropriate.", "Review consent, frequency, deliverability, and support handoff before activation."],
        "steps_ar": ["اختر حدث العميل وتأكد من تسجيله بصورة موثوقة.", "حدّد قواعد الدخول والخروج والاستبعاد والتوقيت.", "اكتب هدف الرسالة وكتل محتواها قبل صياغة النص.", "أضف مجموعة ضابطة أو خطة قياس عند الملاءمة.", "راجع الموافقة والتكرار وقابلية التسليم وتسليم الدعم قبل التفعيل."],
        "output": "A flow map with triggers, timing, message purpose, and measurement notes.",
        "output_ar": "خريطة تدفقات تشمل المحفزات والتوقيت وهدف الرسالة وملاحظات القياس.",
        "limits": "Templates are not configured flows. Confirm current platform behavior, consent rules, and sender requirements before sending.",
        "limits_ar": "القوالب ليست تدفقات مهيأة. تحقق من سلوك المنصة وقواعد الموافقة ومتطلبات المرسل قبل الإرسال.",
    },
    {
        "slug": "search-ai-visibility-audit", "kind": "Audit framework", "kind_ar": "إطار تدقيق",
        "suite": "Search & discovery", "suite_ar": "البحث والاكتشاف",
        "title": "Search & AI Visibility Audit Framework", "title_ar": "إطار تدقيق الظهور في البحث وتجارب الذكاء الاصطناعي",
        "summary": "Review crawlability, page usefulness, entity clarity, and answer readiness without promising citations or rankings.",
        "summary_ar": "راجع قابلية الزحف وفائدة الصفحة ووضوح الكيان والاستعداد للإجابة دون وعد بترتيب أو اقتباس.",
        "task": "Use the audit to find technical and content gaps on a defined page set, then prioritize fixes by evidence and user value.",
        "task_ar": "استخدم التدقيق لاكتشاف فجوات تقنية ومحتوى في صفحات محددة، ثم رتّب الإصلاحات حسب الدليل وقيمة المستخدم.",
        "inputs": "Page list; search queries; Search Console data if available; crawl access; page purpose; current official guidance.",
        "inputs_ar": "قائمة الصفحات؛ استعلامات البحث؛ بيانات Search Console إن توفرت؛ إمكانية الزحف؛ غرض الصفحة؛ الإرشادات الرسمية الحالية.",
        "steps": ["Check indexability, canonical URLs, language versions, and internal links.", "Match each page to a distinct user task and search intent.", "Mark unsupported claims, missing evidence, stale details, and thin sections.", "Improve clear answers, original value, and source attribution where needed.", "Prioritize a small set of fixes and define how their effects will be observed."],
        "steps_ar": ["تحقق من الفهرسة والروابط الأساسية والنسخ اللغوية والروابط الداخلية.", "اربط كل صفحة بمهمة مستخدم ونية بحث مميزة.", "علّم الادعاءات غير المدعومة والأدلة الناقصة والتفاصيل القديمة والأجزاء السطحية.", "حسّن الإجابات الواضحة والقيمة الأصلية ونسب المصادر عند الحاجة.", "رتّب مجموعة محدودة من الإصلاحات وحدد كيفية مراقبة أثرها."],
        "output": "A page-level findings log with evidence, priority, owner, and follow-up measure.",
        "output_ar": "سجل نتائج لكل صفحة يتضمن الدليل والأولوية والمسؤول ومقياس المتابعة.",
        "limits": "Structured data and answer formatting do not guarantee rich results, rankings, or AI citations. Follow current Search Central guidance.",
        "limits_ar": "لا تضمن البيانات المنظمة أو تنسيق الإجابات نتائج غنية أو ترتيبًا أو اقتباسًا من أدوات الذكاء الاصطناعي. اتبع إرشادات Search Central الحالية.",
    },
    {
        "slug": "conversion-experience-audit", "kind": "Audit & scoring template", "kind_ar": "قالب تدقيق وتقييم",
        "suite": "Conversion & experimentation", "suite_ar": "التحويل والتجارب",
        "title": "Conversion Experience Audit", "title_ar": "تدقيق تجربة التحويل",
        "summary": "Assess the landing experience, message match, usability, and measurement before recommending changes.",
        "summary_ar": "قيّم تجربة صفحة الهبوط وتطابق الرسالة وسهولة الاستخدام والقياس قبل اقتراح التغييرات.",
        "task": "Use this framework to review a landing page or commerce journey and convert observations into testable hypotheses.",
        "task_ar": "استخدم الإطار لمراجعة صفحة هبوط أو رحلة متجر وتحويل الملاحظات إلى فرضيات قابلة للاختبار.",
        "inputs": "Page URL; device context; traffic sources; analytics events; customer feedback; business goal; constraints.",
        "inputs_ar": "رابط الصفحة؛ الجهاز؛ مصادر الزيارات؛ أحداث التحليلات؛ ملاحظات العملاء؛ هدف العمل؛ القيود.",
        "steps": ["Walk the journey on mobile and desktop from entry to completion.", "Check message match, clarity, trust evidence, accessibility, and friction.", "Validate that analytics events represent the user action accurately.", "Write each finding as an observation, impact hypothesis, and evidence gap.", "Rank tests by expected learning, effort, and risk; define success and stop rules."],
        "steps_ar": ["تتبّع الرحلة على الهاتف والحاسوب من الدخول حتى الإتمام.", "راجع تطابق الرسالة والوضوح وأدلة الثقة وإمكانية الوصول والاحتكاك.", "تحقق من أن أحداث التحليلات تمثل فعل المستخدم بدقة.", "صغ كل نتيجة كملاحظة وفرضية أثر وفجوة دليل.", "رتّب الاختبارات حسب التعلم المتوقع والجهد والمخاطر وحدد النجاح والإيقاف."],
        "output": "A prioritized audit with evidence-backed hypotheses and a test plan.",
        "output_ar": "تدقيق مرتب يتضمن فرضيات مدعومة بالأدلة وخطة اختبار.",
        "limits": "A score is not proof of uplift. Confirm sample size, instrumentation, and business results before claiming impact.",
        "limits_ar": "الدرجة لا تثبت تحسنًا. تحقق من حجم العينة والقياس ونتائج العمل قبل ادعاء الأثر.",
    },
    {
        "slug": "creator-campaign-brief-builder", "kind": "Brief template & prompt", "kind_ar": "قالب موجز وتعليمات",
        "suite": "Content & creative", "suite_ar": "المحتوى والإبداع",
        "title": "Creator Campaign Brief Builder", "title_ar": "إعداد موجز حملة صانع المحتوى",
        "summary": "Turn a campaign objective and real product evidence into a clear, filmable creator brief.",
        "summary_ar": "حوّل هدف الحملة وأدلة المنتج الفعلية إلى موجز واضح قابل للتصوير لصانع المحتوى.",
        "task": "Use this brief structure before commissioning creator content or asking AI to draft scenes and variations.",
        "task_ar": "استخدم بنية الموجز قبل تكليف صانع محتوى أو طلب صياغة مشاهد ونسخ متنوعة بالذكاء الاصطناعي.",
        "inputs": "Audience; objective; product facts; approved claims; offer terms; channel specs; rights and usage window.",
        "inputs_ar": "الجمهور؛ الهدف؛ حقائق المنتج؛ الادعاءات المعتمدة؛ شروط العرض؛ مواصفات المنصة؛ الحقوق ومدة الاستخدام.",
        "steps": ["State the audience problem and the one action the content should support.", "Separate verified product facts from opinions and claims needing approval.", "Choose a concept, opening, scene sequence, proof moment, and CTA.", "Specify deliverables, safe areas, captions, variants, deadlines, and usage rights.", "Review the draft for accuracy, consent, accessibility, and platform fit."],
        "steps_ar": ["حدّد مشكلة الجمهور والفعل الواحد الذي ينبغي أن يدعمه المحتوى.", "افصل حقائق المنتج المؤكدة عن الآراء والادعاءات التي تحتاج موافقة.", "اختر الفكرة والافتتاحية وتسلسل المشاهد ولحظة الإثبات والدعوة للإجراء.", "حدّد التسليمات والمساحات الآمنة والترجمة والنسخ والمواعيد وحقوق الاستخدام.", "راجع المسودة من حيث الدقة والموافقة وإمكانية الوصول وملاءمة المنصة."],
        "output": "A creator-ready brief with scene beats, factual guardrails, and delivery requirements.",
        "output_ar": "موجز جاهز لصانع المحتوى يتضمن المشاهد وضوابط الحقائق ومتطلبات التسليم.",
        "limits": "The hook dataset is a starting point, not evidence that a formula will perform. Obtain creator approvals and usage rights.",
        "limits_ar": "مجموعة الافتتاحيات نقطة بداية وليست دليلًا على أداء صيغة معينة. احصل على موافقة صانع المحتوى وحقوق الاستخدام.",
    },
    {
        "slug": "paid-media-creative-test-matrix", "kind": "Testing matrix", "kind_ar": "مصفوفة اختبار",
        "suite": "Paid media", "suite_ar": "الإعلانات المدفوعة",
        "title": "Paid Media Creative Testing Matrix", "title_ar": "مصفوفة اختبار الإبداع الإعلاني",
        "summary": "Plan controlled creative tests that separate audience, message, format, and offer hypotheses.",
        "summary_ar": "خطط لاختبارات إبداعية مضبوطة تفصل فرضيات الجمهور والرسالة والصيغة والعرض.",
        "task": "Use this matrix when a team has many creative ideas but needs a readable test sequence and decision rules.",
        "task_ar": "استخدم المصفوفة عندما تتعدد أفكار الفريق وتحتاج إلى تسلسل اختبارات وقواعد قرار واضحة.",
        "inputs": "Business outcome; baseline; audience; creative inventory; budget; test duration; attribution and reporting definitions.",
        "inputs_ar": "نتيجة العمل؛ خط الأساس؛ الجمهور؛ المواد الإبداعية؛ الميزانية؛ مدة الاختبار؛ تعريفات الإسناد والتقرير.",
        "steps": ["Write the hypothesis and one variable to learn about.", "Group variants so each comparison answers a specific question.", "Set a budget and observation window consistent with expected volume.", "Predefine decision thresholds, minimum evidence, and external factors to annotate.", "Record results and the next decision without calling noise a winner."],
        "steps_ar": ["اكتب الفرضية والمتغير الواحد المراد التعلم عنه.", "اجمع النسخ بحيث تجيب كل مقارنة عن سؤال محدد.", "حدّد ميزانية وفترة ملاحظة تتناسبان مع الحجم المتوقع.", "حدّد مسبقًا عتبات القرار والحد الأدنى من الأدلة والعوامل الخارجية للتوثيق.", "سجّل النتائج والقرار التالي دون اعتبار التقلب العشوائي فوزًا."],
        "output": "A test matrix, naming plan, decision log, and learning summary.",
        "output_ar": "مصفوفة اختبار وخطة تسمية وسجل قرار وملخص تعلم.",
        "limits": "The matrix does not guarantee a winning ad. Interpret results with adequate volume, stable tracking, and business-quality outcomes.",
        "limits_ar": "لا تضمن المصفوفة إعلانًا فائزًا. فسّر النتائج بحجم مناسب وقياس مستقر ونتائج تجارية ذات جودة.",
    },
    {
        "slug": "client-marketing-reporting-workflow", "kind": "Prompt set & report template", "kind_ar": "مجموعة تعليمات وقالب تقرير",
        "suite": "Analytics & reporting", "suite_ar": "التحليلات والتقارير",
        "title": "Client Marketing Reporting Workflow", "title_ar": "سير إعداد تقارير التسويق للعملاء",
        "summary": "Turn approved metrics into a concise report that distinguishes observation, interpretation, and recommendation.",
        "summary_ar": "حوّل المقاييس المعتمدة إلى تقرير موجز يفرّق بين الملاحظة والتفسير والتوصية.",
        "task": "Use this workflow for monthly or campaign reporting when the team needs a clear narrative without inventing reasons for changes.",
        "task_ar": "استخدم سير العمل للتقارير الشهرية أو تقارير الحملات عندما تحتاج إلى سرد واضح دون اختلاق أسباب التغيّر.",
        "inputs": "Approved exports; comparison period; goal definitions; annotations; known data gaps; next-period constraints.",
        "inputs_ar": "تقارير معتمدة؛ فترة مقارنة؛ تعريفات الأهداف؛ تعليقات التغييرات؛ فجوات البيانات؛ قيود الفترة التالية.",
        "steps": ["Validate date ranges, currencies, and metric definitions.", "Extract material changes and show the supporting figures.", "Label observations separately from causal explanations.", "State what is unknown and what additional evidence would resolve it.", "Recommend a small number of actions with owners and follow-up measures."],
        "steps_ar": ["تحقق من الفترات والعملات وتعريفات المقاييس.", "استخرج التغييرات المهمة واعرض الأرقام الداعمة.", "افصل الملاحظات عن التفسيرات السببية.", "وضّح المجهول والأدلة الإضافية اللازمة لحسمه.", "اقترح عددًا محدودًا من الإجراءات مع المسؤولين ومقاييس المتابعة."],
        "output": "A client report with source notes, caveats, decisions, and next steps.",
        "output_ar": "تقرير عميل يتضمن المصادر والتحفظات والقرارات والخطوات التالية.",
        "limits": "AI-written narratives must be checked against source data. Do not present platform metrics as verified business outcomes.",
        "limits_ar": "يجب مطابقة السرد المكتوب بالذكاء الاصطناعي مع البيانات المصدرية. لا تعرض مقاييس المنصة كأنها نتائج تجارية مؤكدة.",
    },
    {
        "slug": "gulf-arabic-campaign-localization", "kind": "Localization skill", "kind_ar": "مهارة توطين",
        "suite": "Content & localization", "suite_ar": "المحتوى والتوطين",
        "title": "Gulf Arabic Campaign Localization", "title_ar": "توطين الحملات إلى العربية الخليجية",
        "summary": "Adapt campaign copy to a defined market, audience, channel, and brand voice with native review for uncertain phrasing.",
        "summary_ar": "كيّف نص الحملة لسوق وجمهور وقناة وصوت علامة محددة مع مراجعة متحدث أصلي للصياغات غير المؤكدة.",
        "task": "Use this workflow when adapting Arabic campaign copy across Gulf markets instead of translating word for word.",
        "task_ar": "استخدم سير العمل لتكييف نص عربي بين أسواق الخليج بدل ترجمته حرفيًا.",
        "inputs": "Source copy; target country and audience; channel; brand voice; approved offer and claims; prohibited wording.",
        "inputs_ar": "النص الأصلي؛ الدولة والجمهور؛ القناة؛ صوت العلامة؛ العرض والادعاءات المعتمدة؛ العبارات المحظورة.",
        "steps": ["Identify the source meaning, desired action, and non-negotiable facts.", "Choose the target market and register; do not treat Gulf audiences as one dialect.", "Adapt vocabulary, rhythm, and CTA while preserving meaning and offer terms.", "Flag slang, cultural references, and claims that need native or legal review.", "Read aloud and review the final version in its actual ad placement."],
        "steps_ar": ["حدّد المعنى والفعل المطلوب والحقائق التي لا يجوز تغييرها.", "اختر السوق والسجل اللغوي ولا تعامل جمهور الخليج كأنه لهجة واحدة.", "كيّف المفردات والإيقاع والدعوة مع الحفاظ على المعنى وشروط العرض.", "علّم العامية والإشارات الثقافية والادعاءات التي تحتاج مراجعة محلية أو قانونية.", "اقرأ النص بصوت مسموع وراجعه في موضع الإعلان الفعلي."],
        "output": "Market-specific copy variants with notes for native review and claim approval.",
        "output_ar": "نسخ مخصصة للسوق مع ملاحظات للمراجعة المحلية واعتماد الادعاءات.",
        "limits": "A phrase list cannot establish how every audience speaks. Have a native reviewer confirm naturalness and cultural fit.",
        "limits_ar": "لا تحدد قائمة عبارات طريقة كلام كل جمهور. اطلب من مراجع محلي تأكيد طبيعية الصياغة وملاءمتها الثقافية.",
    },
    {
        "slug": "seasonal-commerce-campaign-planner", "kind": "Campaign planner", "kind_ar": "مخطط حملة",
        "suite": "Paid media & commerce", "suite_ar": "الإعلانات والتجارة",
        "title": "Seasonal Commerce Campaign Planner", "title_ar": "مخطط الحملات الموسمية للتجارة",
        "summary": "Coordinate offer, inventory, media, measurement, and customer support for a time-bound retail campaign.",
        "summary_ar": "نسّق العرض والمخزون والإعلانات والقياس ودعم العملاء لحملة تجارية محددة المدة.",
        "task": "Use the planner before a seasonal promotion to align dependencies and avoid treating last year's assumptions as current facts.",
        "task_ar": "استخدم المخطط قبل العرض الموسمي لمواءمة الاعتماديات وتجنب اعتبار افتراضات العام الماضي حقائق حالية.",
        "inputs": "Confirmed dates; inventory; margin and offer terms; channel plan; fulfillment capacity; tracking; customer-service coverage.",
        "inputs_ar": "التواريخ المؤكدة؛ المخزون؛ الهامش وشروط العرض؛ خطة القنوات؛ قدرة التنفيذ؛ القياس؛ تغطية خدمة العملاء.",
        "steps": ["Confirm dates, stock, price, margin, exclusions, and fulfillment limits.", "Build a backwards timeline for creative, approvals, tracking, and launch QA.", "Set channel roles, budget guardrails, audience exclusions, and escalation owners.", "Prepare daily monitoring for spend, stock, site health, and customer questions.", "Close with an order-level reconciliation and documented learnings."],
        "steps_ar": ["أكد التواريخ والمخزون والسعر والهامش والاستثناءات وحدود التنفيذ.", "أنشئ جدولًا عكسيًا للإبداع والموافقات والقياس ومراجعة الإطلاق.", "حدّد أدوار القنوات وضوابط الميزانية واستثناءات الجمهور ومسؤولي التصعيد.", "جهّز متابعة يومية للإنفاق والمخزون وسلامة الموقع وأسئلة العملاء.", "اختم بمطابقة على مستوى الطلب وتوثيق الدروس."],
        "output": "A dated campaign runbook with owners, checkpoints, and reconciliation steps.",
        "output_ar": "دليل تشغيل مؤرخ للحملة مع المسؤولين ونقاط الفحص وخطوات المطابقة.",
        "limits": "Dates, platform settings, and commercial assumptions change. Confirm them with current official and business sources each cycle.",
        "limits_ar": "تتغير التواريخ وإعدادات المنصات والافتراضات التجارية. أكدها من مصادر رسمية وتجارية حالية في كل دورة.",
    },
    {
        "slug": "linkedin-post-editorial-review", "kind": "Editorial checklist & prompt", "kind_ar": "قائمة تحرير وتعليمات",
        "suite": "Content & creative", "suite_ar": "المحتوى والإبداع",
        "title": "LinkedIn Post Editorial Review", "title_ar": "مراجعة تحرير منشورات LinkedIn",
        "summary": "Improve clarity, usefulness, evidence, and readability without claiming access to ranking weights.",
        "summary_ar": "حسّن الوضوح والفائدة والأدلة وسهولة القراءة دون ادعاء معرفة أوزان الترتيب.",
        "task": "Use the review before publishing a LinkedIn post or adapting a longer idea into a concise professional update.",
        "task_ar": "استخدم المراجعة قبل نشر منشور LinkedIn أو تحويل فكرة مطولة إلى تحديث مهني موجز.",
        "inputs": "Audience; one reader takeaway; source material; author voice; call to action; disclosure requirements.",
        "inputs_ar": "الجمهور؛ فائدة واحدة للقارئ؛ المادة المصدرية؛ صوت الكاتب؛ الدعوة للإجراء؛ متطلبات الإفصاح.",
        "steps": ["State the reader's question and the post's single point.", "Replace unsupported generalities with an example or source.", "Tighten the opening and paragraph flow without manufacturing outrage.", "Check factual accuracy, attribution, privacy, and any commercial disclosure.", "Preview on mobile and confirm the CTA matches the intended discussion."],
        "steps_ar": ["حدّد سؤال القارئ والفكرة الواحدة للمنشور.", "استبدل العموميات غير المدعومة بمثال أو مصدر.", "حسّن الافتتاحية وتسلسل الفقرات دون اختلاق جدل.", "راجع الدقة ونسبة المعلومات والخصوصية وأي إفصاح تجاري.", "عاين المنشور على الهاتف وتأكد من ملاءمة الدعوة للنقاش المقصود."],
        "output": "An edited post plus a short note explaining the substantive changes.",
        "output_ar": "منشور محرر مع ملاحظة موجزة تشرح التعديلات الجوهرية.",
        "limits": "LinkedIn does not publish complete ranking weights. Treat performance observations as hypotheses and assess them with your own data.",
        "limits_ar": "لا تنشر LinkedIn أوزان الترتيب كاملة. تعامل مع ملاحظات الأداء كفرضيات وقيّمها ببياناتك.",
    },
    {
        "slug": "marketer-ai-capability-matrix", "kind": "Capability matrix", "kind_ar": "مصفوفة قدرات",
        "suite": "Marketing operations", "suite_ar": "عمليات التسويق",
        "title": "Marketer AI Capability Matrix", "title_ar": "مصفوفة قدرات الذكاء الاصطناعي للمسوّقين",
        "summary": "Map role-specific AI tasks to evidence of competence, review needs, and a practical development plan.",
        "summary_ar": "اربط مهام الذكاء الاصطناعي حسب الدور بأدلة الكفاءة واحتياجات المراجعة وخطة تطوير عملية.",
        "task": "Use the matrix for team development, role planning, or a portfolio exercise; do not use it as an employment test without validation.",
        "task_ar": "استخدم المصفوفة لتطوير الفريق أو تخطيط الأدوار أو بناء تمرين للمحفظة؛ لا تستخدمها اختبار توظيف دون تحقق.",
        "inputs": "Role scope; current tasks; tool access; data restrictions; skill evidence; manager expectations.",
        "inputs_ar": "نطاق الدور؛ المهام الحالية؛ صلاحية الأدوات؛ قيود البيانات؛ أدلة المهارات؛ توقعات المدير.",
        "steps": ["Choose work tasks that occur in the actual role.", "Separate AI-assisted work from judgment and approval responsibilities.", "Define observable evidence for each capability, not self-rated familiarity.", "Identify one low-risk practice task and one review checkpoint.", "Build a time-bounded learning plan with a work sample and feedback."],
        "steps_ar": ["اختر مهامًا تحدث فعلًا ضمن الدور.", "افصل العمل المدعوم بالذكاء الاصطناعي عن مسؤوليات الحكم والموافقة.", "حدّد دليلًا قابلًا للملاحظة لكل قدرة بدل الاكتفاء بالتقييم الذاتي.", "اختر مهمة تدريب منخفضة المخاطر ونقطة مراجعة.", "أنشئ خطة تعلم محددة المدة تتضمن عينة عمل وتغذية راجعة."],
        "output": "A role matrix, evidence gaps, and a practical learning plan.",
        "output_ar": "مصفوفة للدور وفجوات الأدلة وخطة تعلم عملية.",
        "limits": "The matrix is a development aid, not a labor-market forecast or validated hiring instrument. Adapt it to the actual team and role.",
        "limits_ar": "المصفوفة أداة تطوير وليست توقعًا لسوق العمل أو اختبار توظيف معتمدًا. خصصها للفريق والدور الفعليين.",
    },
    {
        "slug": "meta-marketing-api-change-review", "kind": "Version QA checklist", "kind_ar": "قائمة ضمان إصدار",
        "suite": "Marketing technology", "suite_ar": "تقنيات التسويق",
        "title": "Meta Marketing API Change Review", "title_ar": "مراجعة تغييرات Meta Marketing API",
        "summary": "Use an official-source-first checklist to assess API changes against the fields and workflows your integration actually uses.",
        "summary_ar": "استخدم قائمة تبدأ بالمصادر الرسمية لتقييم تغييرات API مقابل الحقول وسير العمل التي يستخدمها تكاملك فعليًا.",
        "task": "Use this workflow when reviewing a Meta API version change or preparing a release that depends on Marketing API behavior.",
        "task_ar": "استخدم سير العمل عند مراجعة إصدار Meta API أو تجهيز إصدار يعتمد على سلوك Marketing API.",
        "inputs": "Current official changelog; API versions in use; endpoint and field inventory; test account; integration owner; rollback plan.",
        "inputs_ar": "سجل التغييرات الرسمي الحالي؛ إصدارات API المستخدمة؛ قائمة نقاط النهاية والحقول؛ حساب اختبار؛ مسؤول التكامل؛ خطة تراجع.",
        "steps": ["Read the current official changelog and record its publication date.", "Search the integration for affected endpoints, fields, permissions, and assumptions.", "Map each change to an owner, severity, test case, and deadline.", "Run tests in a non-production environment and compare expected payloads.", "Document rollout, monitoring, fallback, and rollback before release."],
        "steps_ar": ["اقرأ سجل التغييرات الرسمي الحالي وسجّل تاريخ نشره.", "ابحث في التكامل عن نقاط النهاية والحقول والصلاحيات والافتراضات المتأثرة.", "اربط كل تغيير بمسؤول وشدة وحالة اختبار وموعد.", "اختبر في بيئة غير إنتاجية وقارن البيانات المتوقعة.", "وثّق الإطلاق والمراقبة والبديل والتراجع قبل النشر."],
        "output": "A version-impact register and release QA checklist tied to official documentation.",
        "output_ar": "سجل أثر الإصدار وقائمة ضمان إصدار مرتبطة بالوثائق الرسمية.",
        "limits": "This page does not assert a current API version or enumerate current deprecations. Recheck Meta's official developer documentation before every use.",
        "limits_ar": "لا تحدد هذه الصفحة إصدار API حاليًا ولا تسرد التغييرات الحالية. راجع وثائق Meta الرسمية قبل كل استخدام.",
    },
]

RELATED_PLAYBOOKS = {
    "meta-ads-reporting-reconciliation": ("/playbooks/revenue-roas-reconciliation/", "/ar/playbooks/revenue-roas-reconciliation/"),
    "ad-account-agent-access-guardrails": ("/frameworks/tasks/FW-092-AMP-450-autonomous-ai-marketing-agent-human-approval-gate-spend/", "/ar/frameworks/tasks/FW-092-AMP-450-autonomous-ai-marketing-agent-human-approval-gate-spend/"),
    "ecommerce-lifecycle-email-flow-library": ("/playbooks/salla-zid-klaviyo-retention-architect/", "/ar/playbooks/salla-zid-klaviyo-retention-architect/"),
    "search-ai-visibility-audit": ("/playbooks/arabic-aeo-geo-visibility-kit/", "/ar/playbooks/arabic-aeo-geo-visibility-kit/"),
    "conversion-experience-audit": ("/playbooks/ecommerce-funnel-diagnostic/", "/ar/playbooks/ecommerce-funnel-diagnostic/"),
    "creator-campaign-brief-builder": ("/playbooks/tiktok-spark-ugc-mena-factory/", "/ar/playbooks/tiktok-spark-ugc-mena-factory/"),
    "client-marketing-reporting-workflow": ("/playbooks/bilingual-client-reporting-workflow/", "/ar/playbooks/bilingual-client-reporting-workflow/"),
    "gulf-arabic-campaign-localization": ("/playbooks/arabic-market-copy-localizer/", "/ar/playbooks/arabic-market-copy-localizer/"),
    "seasonal-commerce-campaign-planner": ("/playbooks/mena-white-friday-11-11-war-room/", "/ar/playbooks/mena-white-friday-11-11-war-room/"),
}
SYSTEMS = [item for item in ALL_ITEMS if item["slug"] not in RELATED_PLAYBOOKS]


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def bullet_list(values: list[str]) -> str:
    return "<ol>" + "".join(f"<li>{esc(v)}</li>" for v in values) + "</ol>"


def write_page(item: dict, lang: str) -> None:
    is_ar = lang == "ar"
    base = "/ar/marketing-systems/" if is_ar else "/marketing-systems/"
    alt = "/marketing-systems/" if is_ar else "/ar/marketing-systems/"
    title = item["title_ar"] if is_ar else item["title"]
    desc = item["summary_ar"] if is_ar else item["summary"]
    kind = item["kind_ar"] if is_ar else item["kind"]
    suite = item["suite_ar"] if is_ar else item["suite"]
    task = item["task_ar"] if is_ar else item["task"]
    inputs = item["inputs_ar"] if is_ar else item["inputs"]
    steps = item["steps_ar"] if is_ar else item["steps"]
    output = item["output_ar"] if is_ar else item["output"]
    limits = item["limits_ar"] if is_ar else item["limits"]
    slug = item["slug"]
    url = BASE + base + slug + "/"
    html_lang = "ar" if is_ar else "en"
    direction = "rtl" if is_ar else "ltr"
    home = "/ar/" if is_ar else "/"
    library = "/ar/marketing-systems/" if is_ar else "/marketing-systems/"
    labels = {
        "portfolio": "الملف المهني" if is_ar else "Portfolio",
        "catalog": "الأنظمة التسويقية" if is_ar else "Marketing systems",
        "use": "متى تستخدمه" if is_ar else "When to use it",
        "inputs": "ما الذي تحتاجه" if is_ar else "What you need",
        "steps": "سير العمل" if is_ar else "Workflow",
        "output": "المخرج العملي" if is_ar else "Practical output",
        "limits": "النطاق والحدود" if is_ar else "Scope and limits",
        "source": "اقرأ الدليل المنسق على GitHub" if is_ar else "Read the formatted guide on GitHub",
        "back": "استكشف الأنظمة" if is_ar else "Explore the systems",
    }
    canonical = url
    schema = {
        "@context": "https://schema.org", "@type": "Article", "headline": title,
        "description": desc, "inLanguage": html_lang, "author": {"@type": "Person", "name": "Mahmoud Abdelnaby", "url": BASE + "/"},
        "isPartOf": {"@type": "CollectionPage", "url": BASE + library, "name": labels["catalog"]},
        "mainEntityOfPage": canonical,
    }
    source = f"{GITHUB}/blob/main/marketing-systems/guides/{lang}/{slug}.md"
    page = f'''<!doctype html><html lang="{html_lang}" dir="{direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | Mahmoud Abdelnaby</title><meta name="description" content="{esc(desc)}"><meta name="author" content="Mahmoud Abdelnaby"><link rel="canonical" href="{esc(canonical)}"><link rel="alternate" hreflang="en" href="{BASE}/marketing-systems/{slug}/"><link rel="alternate" hreflang="ar" href="{BASE}/ar/marketing-systems/{slug}/"><link rel="alternate" hreflang="x-default" href="{BASE}/marketing-systems/{slug}/"><meta property="og:type" content="article"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canonical)}"><link rel="stylesheet" href="/assets/site.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/marketing-systems.css?v=20261027-marketing-systems-v1"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body class="marketing-systems-page"><div class="wrap"><header class="topbar"><a class="brand" href="{home}">MAHMOUD <em>ABDELNABY</em></a><nav class="nav"><a href="{home}">{labels['portfolio']}</a><a class="lang" href="{alt}{slug}/">{'English' if is_ar else 'العربية'}</a></nav></header><main class="systems-detail"><nav class="systems-breadcrumb" aria-label="Breadcrumb"><a href="{home}">{labels['portfolio']}</a><span>/</span><a href="{library}">{labels['catalog']}</a><span>/</span><span aria-current="page">{esc(title)}</span></nav><article><header class="systems-detail-hero"><span class="eyebrow">{esc(suite)} · {esc(kind)}</span><h1>{esc(title)}</h1><p class="systems-answer">{esc(desc)}</p></header><div class="systems-detail-grid"><section><h2>{labels['use']}</h2><p>{esc(task)}</p></section><section><h2>{labels['inputs']}</h2><p>{esc(inputs)}</p></section><section><h2>{labels['steps']}</h2>{bullet_list(steps)}</section><section><h2>{labels['output']}</h2><p>{esc(output)}</p></section><section class="systems-limits"><h2>{labels['limits']}</h2><p>{esc(limits)}</p></section></div><footer class="systems-detail-actions"><a class="btn" href="{source}" target="_blank" rel="noopener noreferrer">{labels['source']} ↗</a><a class="btn secondary" href="{library}">{labels['back']} ↗</a></footer></article></main></div></body></html>'''
    target = ROOT / ("ar" if is_ar else "") / "marketing-systems" / slug / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page, encoding="utf-8")
    md = [f"# {title}", "", desc, "", f"## {labels['use']}", task, "", f"## {labels['inputs']}", inputs, "", f"## {labels['steps']}"]
    md.extend(f"{i}. {step}" for i, step in enumerate(steps, start=1))
    md.extend(["", f"## {labels['output']}", output, "", f"## {labels['limits']}", limits, ""])
    md_path = ROOT / "marketing-systems" / "guides" / lang / f"{slug}.md"
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text("\n".join(md), encoding="utf-8")


def write_index(lang: str) -> None:
    is_ar = lang == "ar"
    home = "/ar/" if is_ar else "/"
    base = "/ar/marketing-systems/" if is_ar else "/marketing-systems/"
    title = "أدلة وسير عمل تسويقية" if is_ar else "Marketing Guides & Workflows"
    desc = ("تضم المجموعة 18 موردًا: 9 أدلة جديدة و9 إحالات إلى أدلة منشورة تغطي مهام التسويق والقياس والإبداع والتشغيل.") if is_ar else ("A curated set of 18 resources: nine new task guides and nine links to existing playbooks, across marketing, measurement, creative, and operations.")
    lead = "أدلة قابلة للاستخدام لمهام تسويقية محددة." if is_ar else "Practical guides for specific marketing tasks."
    intro = "تضم المجموعة 9 أدلة جديدة، إلى جانب 9 موارد موجودة بالفعل ربطناها هنا بدل تكرارها. كل دليل يوضح المدخلات والخطوات والمراجعة والحدود؛ ولا تمثل هذه المواد برمجيات متصلة بالحسابات أو ضمانًا لنتائج تسويقية." if is_ar else "The collection contains nine new guides plus nine existing resources linked here instead of being duplicated. Each new guide explains inputs, steps, review, and limits; these are operating resources, not live account integrations or performance guarantees."
    category = lambda i: i["suite_ar"] if is_ar else i["suite"]
    kind = lambda i: i["kind_ar"] if is_ar else i["kind"]
    title_for = lambda i: i["title_ar"] if is_ar else i["title"]
    summary = lambda i: i["summary_ar"] if is_ar else i["summary"]
    def card(item: dict) -> str:
        linked = item["slug"] in RELATED_PLAYBOOKS
        href = RELATED_PLAYBOOKS[item["slug"]][1 if is_ar else 0] if linked else f"{base}{item['slug']}/"
        badge = ("دليل منشور" if is_ar else "Existing guide") if linked else kind(item)
        return f'''<a class="system-card" href="{href}"><span class="system-card-meta"><span>{esc(category(item))}</span><b>{esc(badge)}</b></span><h2>{esc(title_for(item))}</h2><p>{esc(summary(item))}</p><span class="system-card-arrow" aria-hidden="true">↗</span></a>'''
    cards = "".join(card(item) for item in ALL_ITEMS)
    canonical = BASE + base
    schema = {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": desc, "inLanguage": "ar" if is_ar else "en", "url": canonical, "numberOfItems": len(ALL_ITEMS), "author": {"@type": "Person", "name": "Mahmoud Abdelnaby", "url": BASE + "/"}}
    lang_code = "ar" if is_ar else "en"
    page = f'''<!doctype html><html lang="{lang_code}" dir="{'rtl' if is_ar else 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | Mahmoud Abdelnaby</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="en" href="{BASE}/marketing-systems/"><link rel="alternate" hreflang="ar" href="{BASE}/ar/marketing-systems/"><link rel="alternate" hreflang="x-default" href="{BASE}/marketing-systems/"><meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{canonical}"><link rel="stylesheet" href="/assets/site.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/marketing-systems.css?v=20261027-marketing-systems-v1"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body class="marketing-systems-page"><div class="wrap"><header class="topbar"><a class="brand" href="{home}">MAHMOUD <em>ABDELNABY</em></a><nav class="nav"><a href="{home}">{'الملف المهني' if is_ar else 'Portfolio'}</a><a class="lang" href="{'/marketing-systems/' if is_ar else '/ar/marketing-systems/'}">{'English' if is_ar else 'العربية'}</a></nav></header><main><section class="systems-index-hero"><span class="eyebrow">{'LIBRARY · 18 RESOURCES · 9 NEW GUIDES' if not is_ar else 'مكتبة · ١٨ موردًا · ٩ أدلة جديدة'}</span><h1>{esc(lead)}</h1><p class="systems-index-intro">{esc(intro)}</p></section><section class="systems-grid" aria-label="{esc(title)}">{cards}</section></main><footer class="systems-footnote"><p>{'Platform rules and software versions change. Verify current official guidance before using platform-specific steps.' if not is_ar else 'تتغير سياسات المنصات وإصدارات البرامج. تحقق من الإرشادات الرسمية الحالية قبل استخدام الخطوات الخاصة بمنصة.'}</p></footer></div></body></html>'''
    target = ROOT / ("ar" if is_ar else "") / "marketing-systems" / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page, encoding="utf-8")


def update_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    source = path.read_text(encoding="utf-8")
    source = re.sub(r"<url\b.*?</url>", lambda match: "" if ("/labs/" in match.group() or "/marketing-systems/" in match.group()) else match.group(), source, flags=re.S)
    urls = [("/marketing-systems/", "/ar/marketing-systems/"), ("/ar/marketing-systems/", "/marketing-systems/")]
    for item in SYSTEMS:
        urls.append((f"/marketing-systems/{item['slug']}/", f"/ar/marketing-systems/{item['slug']}/"))
        urls.append((f"/ar/marketing-systems/{item['slug']}/", f"/marketing-systems/{item['slug']}/"))
    blocks = []
    for route, counterpart in urls:
        lang = "ar" if route.startswith("/ar/") else "en"
        other_lang = "en" if lang == "ar" else "ar"
        links = []
        for hreflang, href in ((lang, BASE + route), (other_lang, BASE + counterpart), ("x-default", BASE + (route if lang == "en" else counterpart))):
            links.append(f'    <html:link rel="alternate" hreflang="{hreflang}" href="{href}" />')
        blocks.append("  <url>\n    <loc>" + BASE + route + "</loc>\n" + "\n".join(links) + "\n  </url>")
    closing = "</urlset>"
    if closing not in source:
        raise SystemExit("Sitemap has no urlset closing tag")
    source = source.replace(closing, "\n".join(blocks) + "\n" + closing, 1)
    source = "\n".join(line.rstrip() for line in source.splitlines()) + "\n"
    path.write_text(source, encoding="utf-8")


def main() -> None:
    for slug in RELATED_PLAYBOOKS:
        for parent in (ROOT / "marketing-systems", ROOT / "ar/marketing-systems"):
            stale_page = (parent / slug).resolve()
            if stale_page.parent == parent.resolve() and stale_page.is_dir():
                shutil.rmtree(stale_page)
        for language in ("en", "ar"):
            stale_guide = (ROOT / "marketing-systems" / "guides" / language / f"{slug}.md").resolve()
            if stale_guide.parent == (ROOT / "marketing-systems" / "guides" / language).resolve() and stale_guide.is_file():
                stale_guide.unlink()
    for item in SYSTEMS:
        for lang in ("en", "ar"):
            write_page(item, lang)
    write_index("en")
    write_index("ar")
    update_sitemap()
    print(f"Generated {len(SYSTEMS)} new guides in English and Arabic; linked {len(RELATED_PLAYBOOKS)} existing guides.")


if __name__ == "__main__":
    main()
