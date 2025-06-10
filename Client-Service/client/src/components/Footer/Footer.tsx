// src/components/Footer.tsx

import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-distributed">

			<div className="footer-left">

				<h3>NUMS<span>Bank</span></h3>

				<p className="footer-links">
					<a href="#" className="link-1">Home</a>
				
					<a href="#">About</a>A
					
					<a href="#">Faq</a>
					
					<a href="#">Contact</a>
				</p>

				<p className="footer-company-name">NUMS BANK © 2024</p>
			</div>

			<div className="footer-center">

				<div>
					<i className="fa fa-map-marker"></i>
					<p><span>Near katraj chowk</span> Pune , Maharadhtra , INDIA</p>
				</div>

				<div>
					<i className="fa fa-phone"></i>
					<p>+91-5479622224</p>
				</div>

				<div>
					<i className="fa fa-envelope"></i>
					<p><a href="mailto:support@company.com">numsbank@gmail.com</a></p>
				</div>

			</div>

			<div className="footer-right">

				<p className="footer-company-about">
					<span>About NUMS Bank</span>
					NUMS Bank delivers modern, secure banking solutions with a focus on customer satisfaction. We offer innovative personal and business banking services through easy-to-use digital platforms.
          </p>

				<div className="footer-icons">

					<a href="#"><i className="fa fa-facebook"></i></a>
					<a href="#"><i className="fa fa-twitter"></i></a>
					<a href="#"><i className="fa fa-linkedin"></i></a>
					<a href="#"><i className="fa fa-github"></i></a>

				</div>

			</div>

		</footer>  );
};

export default Footer;
