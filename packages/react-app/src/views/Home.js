import React, {useRef, useEffect} from 'react';
import {useLocation, Switch} from 'react-router-dom';
import ScrollReveal from '../utils/ScrollReveal';
// import sections
import Hero from '../components/sections/Hero';
import FeaturesTiles from '../components/sections/FeaturesTiles';
import FeaturesSplit from '../components/sections/FeaturesSplit';
import Testimonial from '../components/sections/Testimonial';
import Cta from '../components/sections/Cta';
import Transfer from "../components/Transfer/Transfer";
import GenericSection from "../components/sections/GenericSection";

const Home = () => {
  const childRef = useRef();
  let location = useLocation();

  useEffect(() => {
    document.body.classList.add('is-loaded')
    childRef.current.init();
  }, [location]);
  return (
    <ScrollReveal
      ref={childRef}
      children={() => (
        <>
          <Hero className="illustration-section-01"/>
          <FeaturesTiles/>
          <Transfer/>
          <FeaturesSplit invertMobile topDivider imageFill className="illustration-section-02"/>
          {/*<Testimonial topDivider/>*/}
          <Cta split/>
        </>
      )}/>
  );
}

export default Home;