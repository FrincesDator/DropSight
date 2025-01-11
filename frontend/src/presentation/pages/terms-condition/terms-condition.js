import React from "react";
import { useNavigate } from 'react-router-dom';
import "../../../core/style/terms.css";
import backArrow from "../../../assets/svg/backArrow.svg";
import { useMediaQuery, useTheme } from "@mui/material";
 
const TermsOfUse = () => {
    const navigate = useNavigate();
    const textColor = "#4CAF50"; // You can adjust this to match your theme.
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small (mobile)
 
    return (
        <div className={`terms-container ${isMobile ? "mobile-terms" : "desktop-terms"}`}>
            {/* Return Arrow Button */}
            <button
                onClick={() => navigate("/")} // Navigate to the home page on click
                className="back-button"
            >
                <img
                    src={backArrow}
                    alt="Back"
                />
                Back
            </button>
 
            <h1 style={{ fontWeight: 'bold' }}>TERMS OF USE</h1>
            <p className="contact-info"><strong>Last updated November 22, 2024</strong></p>
 
            <h2 className="section-title">AGREEMENT TO OUR LEGAL TERMS</h2>
            <p className="paragraph">
                We are <strong>DropSight Development Team</strong> ("Company," "we," "us," "our"), a company registered in the Philippines at <strong>Lucena City</strong>.
            </p>
            <p className="paragraph">
                We operate the website <a href="http://www.DropSight.com" style={{ textDecoration: 'none', fontSize: '14px' }}>https://www.DropSight.com</a> (the "Site"), as well as any other related
                products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
            </p>
            <p className="paragraph">
                You can contact us by phone at <strong>09380683628</strong>, email at <strong>dropSightSupport@gmail.com</strong>.
            </p>
            <p className="paragraph">
                These Legal Terms constitute a legally binding agreement between you, whether personally or on behalf of an entity ("you"), and <strong>DropSight Development Team</strong>, concerning your access to and use of the Services.
                You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
            </p>
            <p className="paragraph">
                We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you via <strong>dropSightSupport@gmail.com</strong>, as stated in the email message.
                By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
            </p>
            <p className="paragraph">
                The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
            </p>
            <p>We recommend that you print a copy of these Legal Terms for your records.</p>
            <p> </p>
            <h2 className="section-title">Table of Contents</h2>
            <div style={{ paddingLeft: '20px' }}>
                <p><a href="#services" className="terms-link2">1. OUR SERVICES</a></p>
                <p><a href="#property" className="terms-link2">2. INTELLECTUAL PROPERTY RIGHTS</a></p>
                <p><a href="#representations" className="terms-link2">3. USER REPRESENTATIONS</a></p>
                <p><a href="#prohibited" className="terms-link2">4. PROHIBITED ACTIVITIES</a></p>
                <p><a href="#contributions" className="terms-link2">5. USER GENERATED CONTRIBUTIONS</a></p>
                <p><a href="#license" className="terms-link2">6. CONTRIBUTION LICENSE</a></p>
                <p><a href="#management" className="terms-link2">7. SERVICES MANAGEMENT</a></p>
                <p><a href="#privacy" className="terms-link2">8. PRIVACY POLICY</a></p>
                <p><a href="#termination" className="terms-link2">9. TERM AND TERMINATION</a></p>
                <p><a href="#modifications" className="terms-link2">10. MODIFICATIONS AND INTERRUPTIONS</a></p>
                <p><a href="#governing" className="terms-link2">11. GOVERNING LAW</a></p>
                <p><a href="#dispute" className="terms-link2">12. DISPUTE RESOLUTION</a></p>
                <p><a href="#corrections" className="terms-link2">13. CORRECTIONS</a></p>
                <p><a href="#disclaimer" className="terms-link2">14. DISCLAIMER</a></p>
                <p><a href="#liability" className="terms-link2">15. LIMITATIONS OF LIABILITY</a></p>
                <p><a href="#indemnification" className="terms-link2">16. INDEMNIFICATION</a></p>
                <p><a href="#userdata" className="terms-link2">17. USER DATA</a></p>
                <p><a href="#electronic" className="terms-link2">18. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></p>
                <p><a href="#miscellaneous" className="terms-link2">19. MISCELLANEOUS</a></p>
                <p><a href="#warranties" className="terms-link2">20. DISCLAIMER OF WARRANTIES</a></p>
                <p><a href="#limitations" className="terms-link2">21. LIMITATION OF LIABILITY</a></p>
                <p><a href="#contact" className="terms-link2">22. CONTACT US</a></p>
            </div>
            <p className="divider"> </p>
 
            <section id="services">
                <h3 className="section-title">1. OUR SERVICES</h3>
                <p className="paragraph">
                    The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                </p>
            </section>
 
            <section id="property">
                <h3 className="section-title">2. INTELLECTUAL PROPERTY RIGHTS</h3>
                <h2 className="sub-section-title">Our intelectual property</h2>
                <p className="paragraph">
                    We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"),
                    as well as the trademarks, service marks, and logos contained therein (the "Marks").
                </p>
                <p className="paragraph">
                    Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
                </p>
                <p className="paragraph">
                    The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
                </p>
                <h2 className="sub-section-title">Your use of our Services</h2>
                <p className="paragraph" style={{ display: 'inline' }}>
                    Subject to your compliance with these Legal Terms, including the <a href="#prohibited" style={{ textDecoration: "none" }}>"PROHIBITED ACTIVITIES"</a> section below, we grant you a non-exclusive, non-transferable, revocable license to:
                </p>
                <ul style={{ marginLeft: '20px' }}>
                    <li className="paragraph">access the Services; and</li>
                    <li className="paragraph">download or print a copy of any portion of the Content to which you have properly gained access,</li>
                </ul>
 
                <p className="paragraph">
                    solely for your personal, non-commercial use or internal business purpose.
                </p>
 
                <p className="paragraph">
                    Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced,
                    aggregated, republished, uploaded, posted, publicly displayed, encoded,
                    translated, transmitted, distributed, sold, licensed, or otherwise exploited
                    for any commercial purpose whatsoever, without our express prior written
                    permission.
                </p>
 
                <p className="paragraph">If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: dropSightSupport@gmail.com. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
                </p>
 
                <p className="paragraph">
                    We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
                </p>
 
                <p className="paragraph">
                    Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
                </p>
 
                <h2 className="sub-section-title">Your submissions and contributions</h2>
                <p className="paragraph">
                    Please review this section and the <a href="#prohibited" style={{ textDecoration: "none" }}>"PROHIBITED ACTIVITIES"</a> ection carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.ection carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
                </p>
 
                <p className="paragraph">
                    <span style={{ color: 'rgb(89, 89, 89)', fontWeight: 'bold' }}>Submissions:</span> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                </p>
 
                <p className="paragraph">
                    <span style={{ color: 'rgb(89, 89, 89)', fontWeight: 'bold' }}>Contribution:</span>The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services, including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal information, or other material ("Coontributions"). Any Submission that is publicly posted shall also be treated as a Contribution.
                </p>
 
                <p className="paragraph">
                    You understand that Contributions may be viewable by other users of the Services
                </p>
 
                <p className="paragraph">
                    <span style={{ color: 'rgb(89, 89, 89)', fontWeight: 'bold' }}>When you post Contributions, you grant us a (including use of your name, trademarks, and logos):</span> By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicense the licensesgranted in this section. Our use and distribution may occur in any media formats and through any media channels.
                </p>
 
                <p className="paragraph">
                    This license is licensed under includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.
                </p>
 
                <p className="paragraph">
                    <span style={{ color: 'rgb(89, 89, 89)', fontWeight: 'bold' }}>You are responsible for what you post or upload:</span> By sending us Submissions and/or posting Contributions through any part of the Services or making Contributions accessible through the Services by linking your account through the Services to any of your social networking accounts, you:
                </p>
 
                <ul style={{ marginLeft: '20px' }}>
                    <li className="paragraph">confirm that you have read and agree with our <a href="#prohibited" style={{ textDecoration: "none" }}>"PROHIBITED ACTIVITIES"</a> and will not post, send, publish, upload, or transmit through the Services any Submission  nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;</li>
                    <li className="paragraph">to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;</li>
                    <li className="paragraph">warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licenses to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and</li>
                    <li className="paragraph">warrant and represent that your Submissions do not constitute confidential information.</li>
                </ul>
 
                <p className="paragraph">
                    You are solely responsible for your Submissions and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.
                </p>
 
                <p className="paragraph">
                    <span style={{ color: 'rgb(89, 89, 89)', fontWeight: 'bold' }}>We may remove or edit your Content:</span> Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such Contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.
                </p>
 
            </section>
 
 
            <section id="representations">
                <h3 className="section-title">3. USER REPRESENTATIONS</h3>
                <p className="paragraph">
                    By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a
                    minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or
                    otherwise; (4) you will not access the Services through automated or non-human means, whether through a bot, script or
                    otherwise; (5) your use of the Services will not violate any applicable law or regulation.
                </p>
 
                <p className="paragraph">If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).</p>
            </section>
 
            <section id="prohibited">
                <h3 className="section-title">4. PROHIBITED ACTIVITIES</h3>
                <p className="paragraph">
                    You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial except those that are specifically endorsed or approved by us.
                </p>
 
                <p className="paragraph">
                    As a user of the Services, you agree not to:
                </p>
 
                <ul style={{ marginLeft: '20px' }}>
                    <li className="paragraph">Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                    <li className="paragraph">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                    <li className="paragraph">Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
                    <li className="paragraph">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                    <li className="paragraph">Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                    <li className="paragraph">Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                    <li className="paragraph">Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                    <li className="paragraph">Engage in unauthorized framing of or linking to the Services.</li>
                    <li className="paragraph">Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
                    <li className="paragraph">Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                    <li className="paragraph">Delete the copyright or other proprietary rights notice from any Content.</li>
                    <li className="paragraph">Attempt to impersonate another user or person or use the username of another user.</li>
                    <li className="paragraph">Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats, 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").</li>
                    <li className="paragraph">Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
                    <li className="paragraph">Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                    <li className="paragraph">Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
                    <li className="paragraph">Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                    <li className="paragraph">Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
                    <li className="paragraph">Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</li>
                    <li className="paragraph">Use a buying agent or purchasing agent to make purchases on the Services.</li>
                    <li className="paragraph">Make any unauthorized  use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
                    <li className="paragraph">Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
                </ul>
            </section>
 
            <section id="contributions">
                <h3 className="section-title">5. USER GENERATED CONTRIBUTIONS</h3>
                <p className="paragraph">
                    The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
                </p>
 
                <ul style={{ marginLeft: '20px' }}>
                    <li className="paragraph">The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
                    <li className="paragraph">You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                    <li className="paragraph">You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                    <li className="paragraph">Your Contributions are not false, inaccurate, or misleading.</li>
                    <li className="paragraph">Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
                    <li className="paragraph">Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</li>
                    <li className="paragraph">Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
                    <li className="paragraph">Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</li>
                    <li className="paragraph">Your Contributions do not violate any applicable law, regulation, or rule.</li>
                    <li className="paragraph">Your Contributions do not violate the privacy or publicity rights of any third party.</li>
                    <li className="paragraph">Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
                    <li className="paragraph">Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
                    <li className="paragraph">Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</li>
                </ul>
 
                <p className="paragraph">Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.</p>
            </section>
 
            <section id="license">
                <h3 className="section-title">6. CONTRIBUTION LICENSE</h3>
                <p className="paragraph">
                    By posting your Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.
                </p>
 
                <p className="paragraph">
                    This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.
                </p>
 
                <p className="paragraph">
                    We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
                </p>
 
                <p className="paragraph">
                    We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.
                </p>
            </section>
 
            <section id="management">
                <h3 className="section-title">7. SERVICES MANAGEMENT</h3>
                <p className="paragraph">
                    We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
                </p>
            </section>
 
            <section id="privacy">
                <h3 className="section-title">8. PRIVACY POLICY</h3>
                <p className="paragraph">
                    We care about data privacy and security. Please review our Privacy Policy: <strong>testPrivacy</strong>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in the Philippines. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in the Philippines, then through your continued use of the Services, you are transferring your data to the Philippines, and you expressly consent to have your data transferred to and processed in the Philippines.
                </p>
            </section>
 
            <section id="termination">
                <h3 className="section-title">9. TERM AND TERMINATION</h3>
                <p className="paragraph">
                    These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
                </p>
                <p className="paragraph">
                    If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
                </p>
            </section>
 
            <section id="modifications">
                <h3 className="section-title">10. MODIFICATIONS AND INTERRUPTIONS</h3>
                <p className="paragraph">We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.</p>
                <p className="paragraph">
                    We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
                </p>
            </section>
 
            <section id="governing">
                <h3 className="section-title">11. GOVERNING LAW</h3>
                <p className="paragraph">These Legal Terms shall be governed by and defined following the laws of the Philippines. The Development Team and yourself irrevocably consent that the courts of the Philippines shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>
            </section>
 
            <section id="dispute">
                <h3 className="section-title">12. DISPUTE RESOLUTION</h3>
                <p className="paragraph">
                    You agree to irrevocably submit all disputes related to these Legal Terms or the legal relationship established by these Legal Terms to the jurisdiction of <strong>Lucena</strong>, Philippines shall also maintain the right to bring proceedings as to the substance of the matter in the courts of the country where you reside or, if these Legal Terms are entered into in the course of your trade or profession, the state of your principal place of business.
                </p>
            </section>
 
            <section id="corrections">
                <h3 className="section-title">13. CORRECTIONS</h3>
                <p className="paragraph">
                    There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
                </p>
            </section>
 
            <section id="disclaimer">
                <h3 className="section-title">14. DISCLAIMER</h3>
                <p className="paragraph">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT OR MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.</p>
            </section>
 
            <section id="liability">
                <h3 className="section-title">15. LIMITATIONS OF LIABILITY</h3>
                <p className="paragraph">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO
                    THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US 10,000.00 CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
                </p>
            </section>
 
            <section id="indemnification">
                <h3 className="section-title">16. INDEMNIFICATION</h3>
                <p className="paragraph">You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.</p>
            </section>
 
            <section id="userdata">
                <h3 className="section-title">17. USER DATA</h3>
                <p className="paragraph">We will maintain
                    certain data that you transmit to the Services for the purpose of managing the
                    performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups
                    of data, you are solely responsible for all data that you transmit or that
                    relates to any activity you have undertaken using the Services. You agree
                    that we shall have no liability to you for any loss or corruption of any such
                    data, and you hereby waive any right of action against us arising from any such
                    loss or corruption of such data.</p>
            </section>
 
            <section id="electronic">
                <h3 className="section-title">18. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h3>
                <p className="paragraph">Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.</p>
            </section>
 
            <section id="miscellaneous">
                <h3 className="section-title">19. MISCELLANEOUS</h3>
                <p className="paragraph">These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. </p>
            </section>
 
            <section id="warranties">
                <h3 className="section-title">20. DISCLAIMER OF WARRANTIES</h3>
                <p className="paragraph">The app is provided on an "as is" and "as available" basis. We make no warranties, whether express or implied, regarding its functionality, availability, or suitability for your specific needs.</p>
            </section>
 
            <section id="limitations">
                <h3 className="section-title">21. LIMITATION OF LIABILITY</h3>
                <p className="paragraph">To the fullest extent permitted by law, DropSight is not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the app. In no event shall our total liability exceed the amount you have paid for the app’s services in the 12 months preceding the incident.</p>
            </section>
 
            <section id="contact">
                <h3 className="section-title">22. CONTACT US</h3>
                <p className="paragraph">
                    In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
                </p>
                <p className="contact-info">
                    ____________ <br />
                    <strong>Philippines</strong> <br />
                    <strong>Phone: 09380683628</strong> <br />
                    <strong>dropsightsupport@gmail.com</strong>
                </p>
            </section>
 
        </div>
    );
};
 
export default TermsOfUse;