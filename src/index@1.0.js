gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
let lenis;

 if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration:1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}


let isMobile = window.innerWidth < 550;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

CustomEase.create(
  "main",
  "0.65, 0.01, 0.05, 0.99"
);

gsap.defaults({
  ease:"main",
  duration:0.725
})




function handleOrientationChange() {
  setTimeout(function () {
    window.location.reload();
  }, 250);
}
window.addEventListener("orientationchange", handleOrientationChange);

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function initSplit(next) {
  let lineTargets = next.querySelectorAll('[data-split="lines"]')
  let letterTargets = next.querySelectorAll('[data-split="letters"]')
  let headings = next.querySelectorAll("[data-heading]")

  var splitTextLines = new SplitText(lineTargets, {
    type: "lines",
    linesClass: "single-line"
  });
  
  splitTextLines.lines.forEach((line, index) => {
    let wrapper = document.createElement('div');
    wrapper.classList.add('single-line-wrap');
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
  });  

  var splitTextLetters = new SplitText(letterTargets, {
    type: "chars",
    charsClass: "single-letter"
  });
  
  
  splitTextLetters.chars.forEach((letters, index) => {
    let delay = (index / 100) + 's';
    letters.style.setProperty('transition-delay', delay);
  })
  
  //
  //
  
  headings.forEach(heading => {
    let animatedHeadings = new SplitText(heading, {
      type: "lines, words",
      linesClass: "single-line"
    });
  
    animatedHeadings.lines.forEach((line, index) => {
      let wrapper = document.createElement('div');
      wrapper.classList.add('single-line-wrap');
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      
      let delay = (index / 10) + 's';
      line.style.setProperty('transition-delay', delay);
    });
  
    if (heading.hasAttribute("heading-reveal-scroll")) {
      ScrollTrigger.create({
        trigger: heading,
        start: "top 95%",
        onEnter: () => {
          heading.setAttribute("data-heading", "visible");
        }
      });
    }
  });
  
  
}

function initPageLoad(next){
  
  const nav = next.querySelector(".nav-w")
  const main = next || document.querySelector(".main-w")
  const hero = main.querySelector(".section")
  const navLinks = nav.querySelectorAll(".li")
  const navLogo = nav.querySelector(".nav-logo")
  const loadTargets = next.querySelectorAll("[data-load-stagger]")
  const titles = hero.querySelectorAll("[heading-reveal-load]")
  const homeImage = hero.querySelector(".hero-img__wrap")
  
  let tl = gsap.timeline({
    onStart:()=>{
      titles.forEach((title) =>{
        gsap.delayedCall(0.1, ()=>{
          title.setAttribute("data-heading", "visible")
        })
        
      })
    }
  })
  
  tl.set([main, nav],{ autoAlpha: 1})
  .from(navLinks,{ yPercent: 125, stagger: 0.1})
  .from(loadTargets,{ yPercent: 40, autoAlpha: 0, stagger:0.08},"<")
  
  if(main.hasAttribute("data-barba-namespace","home")){
    tl.from(homeImage,{clipPath:"inset(50%)",duration:1})
  }

}

function initHeadings(next) {
  let targets = next.querySelectorAll("[data-heading-reveal]");

  targets.forEach(heading => {
    const originalText = heading.textContent;
    heading.textContent = "";
    const chars = originalText.split("");

    const cursor = document.createElement("span");
    cursor.classList.add("cursor");
    cursor.textContent = "|";
    heading.appendChild(cursor);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 80%",
      }
    });

    chars.forEach((char, i) => {
      tl.to({}, {
        duration: gsap.utils.random(0.03 , 0.2),
        onUpdate: () => {
          heading.textContent = originalText.slice(0, i + 1); 
          heading.appendChild(cursor); 
        },
        ease: "none"
      });
    });

    tl.to(cursor, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => cursor.remove()
    });
  });
}

function initParallaxImages(next) {
  let targets = next.querySelectorAll("[data-parallax-target]");

  function setParallax(target, parent, direction) {
    let parentHeight = parent.offsetHeight;
    let targetHeight = target.offsetHeight;
    let difference = targetHeight - parentHeight;
    let distance = difference / 3
    
    let reversed = direction === "reverse"
    
    gsap.fromTo(target, {
      y: reversed ? 0 : -difference,
    }, {
      y: reversed ? -difference : distance,
      ease: "none",
      scrollTrigger: {
        trigger: parent,
        start: "clamp(top bottom)",
        end: "clamp(bottom top)",
        scrub: true,
      }
    });
  }

  function updateParallax(target, parent, direction) {
    let parentHeight = parent.offsetHeight;
    let targetHeight = target.offsetHeight;
    let difference = targetHeight - parentHeight;
    let reversed = direction === "reverse";
    
    gsap.to(target, { y: reversed ? 0 : -difference });
  }

  if (targets) {
    targets.forEach((target) => {
      let direction = target.getAttribute("data-parallax-direction")
      if(direction === null){ direction = "normal" } else { direction= "reverse" }
      
      let parent = target.parentElement;
      if (parent) {
        setParallax(target, parent, direction);

      const debouncedUpdateParallax = debounce(() => {
        updateParallax(target, parent, direction);
      }, 250);
      
      window.addEventListener('resize', debouncedUpdateParallax);
      }
    });
  }
}

function initMarqueeScroll(next) {
  const logoWrappers = document.querySelectorAll('.logo-wrapper');
  
  logoWrappers.forEach((marqueeGroup) => {
    const marqueeItems = marqueeGroup.querySelectorAll('.logo-marquee-wrap');
    const marqueeItemsWidth = marqueeItems[0]?.offsetWidth || 0;

    let marqueeSpeed =
      parseFloat(marqueeGroup.querySelector("[data-marquee-speed]").getAttribute('data-marquee-speed')) *
      (marqueeItemsWidth / window.innerWidth);

    if (window.innerWidth <= 600) {
      marqueeSpeed *= 0.5;
    }

    let direction = 1;

    const marqueeLeft = roll(
      marqueeGroup.querySelectorAll("[data-marquee-direction='left'] .logo-marquee-wrap"),
      { duration: marqueeSpeed }
    );
    const marqueeRight = roll(
      marqueeGroup.querySelectorAll("[data-marquee-direction='right'] .logo-marquee-wrap"),
      { duration: marqueeSpeed },
      true
    );

    // ScrollTrigger for visibility
    ScrollTrigger.create({
      trigger: marqueeGroup,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        marqueeLeft.play();
        marqueeRight.play();
      },
      onLeave: () => {
        marqueeLeft.pause();
        marqueeRight.pause();
      },
      onEnterBack: () => {
        marqueeLeft.play();
        marqueeRight.play();
      },
      onLeaveBack: () => {
        marqueeLeft.pause();
        marqueeRight.pause();
      },
    });

    // ScrollTrigger for direction change
    ScrollTrigger.create({
      trigger: document.querySelector('.main-w'),
      onUpdate(self) {
        if (self.direction !== direction) {
          direction *= -1;
          gsap.to([marqueeLeft, marqueeRight], { timeScale: direction, overwrite: true });
        }

        marqueeGroup
          .querySelector("[data-marquee-status]")
          .setAttribute('data-marquee-status', self.direction === -1 ? 'normal' : 'inverted');
      },
    });

    // Helper function to create the animation
    function roll(targets, vars, reverse) {
      vars = vars || {};
      vars.ease || (vars.ease = 'none');

      const tl = gsap.timeline({
          repeat: -1,
          paused: true,
          onReverseComplete() {
            this.totalTime(this.rawTime() + this.duration() * 10);
          },
        }),
        elements = Array.from(targets),
        clones = elements.map((el) => {
          const clone = el.cloneNode(true);
          el.parentNode.appendChild(clone);
          return clone;
        });

      const positionClones = () => {
        elements.forEach((el, i) => {
          const clone = clones[i];
          gsap.set(clone, {
            position: 'absolute',
            overwrite: false,
            top: el.offsetTop,
            left: el.offsetLeft + el.offsetWidth,
          });
        });
      };

      positionClones();

      elements.forEach((el, i) =>
        tl.to([el, clones[i]], { xPercent: reverse ? 100 : -100, ...vars }, 0)
      );

      window.addEventListener('resize', debounce(() => {
        const time = tl.totalTime();
        tl.totalTime(0);
        positionClones();
        tl.totalTime(time);
      }, 200));

      return tl;
    }
    
  });
}

function initPeopleHero(next) {
    const listElement = next.querySelector('[data-people="list"]');
    const wrapDesktop = next.querySelector('[data-people="wrap-desktop"]');
    const wrapMobile = next.querySelector('[data-people="wrap-mobile"]');
    const items = listElement ? listElement.querySelectorAll('[data-people="item"]') : null;

    if (listElement && items) {
      if(isMobileLandscape){
        wrapMobile.appendChild(listElement);
      } else{
        wrapDesktop.appendChild(listElement);
      }
      
        items.forEach(item => {
            gsap.set(item, { autoAlpha: 0 });
        });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

function initFaq(next) {
  let faqs = next.querySelectorAll(".faq-item");

  faqs.forEach(faq => {
    let link = faq.querySelector(".faq-link");
    let content = faq.querySelector(".faq-content");
    let lines = faq.querySelectorAll(".single-line")

    link.addEventListener("click", () => {
      faqs.forEach(otherFaq => {
        if (otherFaq !== faq && otherFaq.getAttribute("data-state") === "open") {
          let innerLink = otherFaq.querySelector(".faq-link");
          innerLink.click()
        }
      });

      if (faq.getAttribute("data-state") === "closed") {
        faq.setAttribute("data-state", "open");
        gsap.to(content, {
          height: "auto",
        });
        gsap.set(lines,{opacity:1, transition:"unset"})
        gsap.fromTo(lines, { y: "110%" }, { y: "0%", stagger: 0.05 })
      } else {
        faq.setAttribute("data-state", "closed");
        gsap.to(content, {
          height: 0,
          duration: 0.65
        });
        gsap.to(lines, { y: "110%" })
      }
    });
  });
}

function initContactPage(next) {
  let hero = next.querySelector(".section");
  let footer = next.querySelector(".footer");
  let contactEmbed = next.querySelector("[data-contact-embed]");
  let button = hero.querySelector(".button")

  function updateHeroHeight() {
    const footerHeight = footer.offsetHeight;
    const windowHeight = window.innerHeight;
    hero.style.minHeight = `${windowHeight - footerHeight}px`;
  }
  
  updateHeroHeight();
  window.addEventListener("resize", updateHeroHeight);

  
  if (contactEmbed) {
    const typeformDiv = document.createElement("div");
    typeformDiv.setAttribute("data-tf-live", "01JEHHCGRNG0XZXCJE41QDXJG1");
    contactEmbed.appendChild(typeformDiv);
  
    button.addEventListener("click", () => {
      let tf = typeformDiv.querySelector("button")
      tf.click()
    })
  
  }
  
}

function initTypeformTriggers(next){
  let wrappers = next.querySelectorAll("[data-form-container]")
  if(wrappers.length > 0){
    
    wrappers.forEach((wrapper) => {
      let button = wrapper.querySelector(".button")
      
      button.addEventListener("click", () => {
        let tf = wrapper.querySelector("button")
        tf.click()
      })
      
    });
    
  }
}

function initLocationGIF(next) {
  
  const items = next.querySelectorAll("[data-city-item]")

    if (items) {

        items.forEach(item => { gsap.set(item, { autoAlpha: 0 }); });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

function initReelGIF(next){
    const items = next.querySelectorAll("[data-reel-item]")

    if (items) {

        items.forEach(item => { gsap.set(item, { autoAlpha: 0 }); });

        let index = 0;

        function showNextItem() {
            gsap.set(items[index], { autoAlpha: 0 });

            index = (index + 1) % items.length;

            gsap.to(items[index], {
                autoAlpha: 1,
                duration: 0.01,
            });
        }
        setInterval(showNextItem, 500); 
    }
}

function initVideoPreview(next){
  let targets = next.querySelectorAll("[data-project-cta]")
  
  if(targets){
    function handleVideoLogic() {
      if (window.innerWidth > 991) {
        targets.forEach(function (item) {
          var video = item.querySelector('video');
          let wrap = item.querySelector("[data-thumb-vid]")
          
          if (video && video.dataset.src) {
            item.addEventListener("mouseenter", function () {
              gsap.set(wrap,{display:"block"})
              if (!video.src) {
                video.src = video.dataset.src; 
                video.load(); 
              }
            });
          }
          
          item.addEventListener("mouseleave", function () {
            gsap.set(wrap,{display:"none"})
          })
          
        });
      } else {
        targets.forEach(function (item) {
          var video = item.querySelector('video');
          if (video) {
            video.src = ""; 
          }
        });
      }
    }

    handleVideoLogic();
    window.addEventListener("resize", handleVideoLogic);
  }
}
//
//
//
//
//
//
//
//
//

function initGeneral(next){
  document.fonts.ready.then(() => {
    initSplit(next) 
  })
  initLocationGIF(next)
  initVideoPreview(next)
//

}

//
//
//

barba.hooks.leave(() => {
  lenis.destroy();
});

barba.hooks.enter((data) => {
  let next = data.next.container;
});

barba.hooks.afterEnter((data) => {
  let next = data.next.container;
  let name = data.next.namespace;
  
  let triggers = ScrollTrigger.getAll();
  triggers.forEach((trigger) => {
    trigger.kill();
  });

  initPageLoad(next)

  if(Webflow.env("editor") === undefined){
    lenis = new Lenis({
      duration: 1,
      wrapper: document.body,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
    });
    lenis.scrollTo(".page-w", {
      duration: 0.5,
      force: true,
      lock: true,
    });
  }

  initGeneral(next);
});

barba.init({
  debug: true,
  preventRunning: true,
  prevent: function ({ el }) {
    if (el.hasAttribute("data-barba-prevent")) {
      return true;
    }
  },
  transitions: [
    {
      name: "default",
      sync: false,
      once() {
        if(Webflow.env("editor") === undefined){
          lenis.start();
        }
      },
      leave(data) {
      
      const tl = gsap.timeline({
          onComplete: () => {
            data.current.container.remove()
          }
        });
        tl.to(data.current.container,{autoAlpha: 0, duration: 0.8})
        return tl;
      },
      enter(data) {
        
        let tl = gsap.timeline()
        let delay = 0.25;
        // tl.to(transitionWrap,{clipPath:"inset(100% 0px 0% 0px)", duration:1, delay: delay,onComplete:()=>{lenis.start()}})
        // .to(transitionTitles[0],{ x:"2em" },"<")
        // .to(transitionTitles[2],{ x:"-2em" },"<")
        // .fromTo(".nav-center__wrap",{width:"0%"},{width:"90%",duration:1},"<+=0.4")
      },
    },
  ],
  views: [
    {
      namespace: "home",
      afterEnter(data) {
        let next = data.next.container;
        initPeopleHero(next)
        initMarqueeScroll(next)
        initReelGIF(next)
        initTypeformTriggers(next)
      },
    },
    {
      namespace: "about",
      afterEnter(data) {
        let next = data.next.container;
        initFaq(next)
      },
    },
    {
      namespace: "contact",
      afterEnter(data) {
        let next = data.next.container;
       // initContactPage(next)
      },
    },
  ],
});
    