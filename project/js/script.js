// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INITIAL TRANSITIONS & ANIMATIONS ---
    // Fade in Navigation bar
    setTimeout(() => {
        const nav = document.getElementById('nav-bar');
        if (nav) nav.classList.add('active');
    }, 200);
    // Fade in Hero content elements sequentially
    const heroElements = document.querySelectorAll('.hero-fade');
    heroElements.forEach((el) => {
        const delayAttr = el.getAttribute('style') || '';
        const delayMatch = delayAttr.match(/delay:\s*(\d+)ms/);
        const delay = delayMatch ? parseInt(delayMatch[1]) : 400;
        
        setTimeout(() => {
            el.classList.add('active');
        }, delay);
    });
    // --- 2. NAVIGATION BAR & MOBILE MENU ---
    const navBar = document.getElementById('nav-bar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    // Scroll state trigger for navigation bar background
    const handleScroll = () => {
        if (window.scrollY > window.innerHeight * 0.8) {
            navBar.classList.add('scrolled');
        } else {
            navBar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    // Toggle Mobile menu
    const toggleMenu = () => {
        menuToggle.classList.toggle('open');
        mobileMenu.classList.toggle('active');
    };
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    // Close menu when clicking navigation links or clicking outside
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('active');
        });
    });
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('active');
        }
    });
    // --- 3. INTERSECTION OBSERVER FOR SCROLL REVEALS ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger children reveal animations
                const revealElements = entry.target.querySelectorAll('.reveal-el');
                revealElements.forEach(el => el.classList.add('active'));
                // Handle timeline line scale reveal
                const timelineSpine = entry.target.querySelector('.timeline-spine');
                if (timelineSpine) timelineSpine.classList.add('active');

                const circles = entry.target.querySelectorAll('.timeline-circle');
                circles.forEach(circle => circle.classList.add('active'));
                // If it is the footer, let's load/enable the CSS Paint worklet
                if (entry.target.id === 'footer') {
                    enableFooterPaint();
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.scroll-reveal').forEach(section => {
        revealObserver.observe(section);
    });
    // --- 4. HOUDINI PAINT WORKLET FOR FOOTER ---
    let paintInitialized = false;
    const enableFooterPaint = () => {
        if (paintInitialized) return;
        paintInitialized = true;
        
        const paintArea = document.getElementById('footer-paint-area');
        const paintTarget = document.getElementById('paint-target');
        
        if (!paintArea || !paintTarget) return;
        // Try registering paint worklet
        if ('paintWorklet' in CSS) {
            try {
                CSS.paintWorklet.addModule('js/houdini-rainbow.js').then(() => {
                    paintTarget.style.backgroundImage = 'paint(rainbow)';
                    paintTarget.style.animation = 'rainbow-animation 5s infinite ease-in-out alternate';
                    paintTarget.style.opacity = '0.3';
                    paintArea.style.opacity = '1';
                }).catch(() => {
                    // Fallback to opacity reveal only on error loading worklet
                    paintArea.style.opacity = '1';
                });
            } catch (e) {
                paintArea.style.opacity = '1';
            }
        } else {
            // Fallback for browsers that don't support Houdini Paint API
            paintArea.style.opacity = '1';
        }
    };
    // --- 6. POINTER COORDINATES TRACKER (with Lerp) ---
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const lerpFactor = 0.05;
    const handlePointerMove = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        pointer.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        pointer.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    const updatePointer = () => {
        pointer.x += (pointer.targetX - pointer.x) * lerpFactor;
        pointer.y += (pointer.targetY - pointer.y) * lerpFactor;
        requestAnimationFrame(updatePointer);
    };
    updatePointer();
    // --- 7. THREE.JS 3D HERO CANVAS ---
    const initHero3D = () => {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;
        const fogColor = 0xf5f0eb;
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(fogColor, 10, 30);
        scene.background = new THREE.Color(fogColor);
        let aspect = window.innerWidth / window.innerHeight;
        const d = 8;
        const camera = new THREE.OrthographicCamera(
            -d * aspect, d * aspect, d, -d, 1, 1000
        );
        camera.position.set(0, 3, 8);
        camera.lookAt(scene.position);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);
        // Custom Airplane Mesh construction
        const createAirplane = () => {
            const airplane = new THREE.Group();
            const bodyGeom = new THREE.BufferGeometry();
            const bodyVertices = new Float32Array([
                1, 0, 0,
                0.8, 0, 0,
                0, 0.8, 0,
                0, 0.2, 0,
                -1, 0, 0,
                -1, 0, 0.6,
                0, 0.2, 0.6,
                0, 0.8, 0.6,
                0.8, 0, 0.6,
                1, 0, 0.6,
                0, -0.1, 0.3,
            ]);
            bodyGeom.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
            // Recalculate normals so lighting works correctly
            bodyGeom.computeVertexNormals();
            const bodyMesh = new THREE.Mesh(
                bodyGeom,
                new THREE.MeshPhongMaterial({ color: 0x262626, side: THREE.DoubleSide })
            );
            const wingGeom = new THREE.BufferGeometry();
            const wingVertices = new Float32Array([
                0, 0, 0,
                -1, 0, 0,
                0, 0, 0.6,
                1, 0, 0,
                1.5, 0, 0.3,
                0, 0, 0.6,
            ]);
            wingGeom.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
            wingGeom.computeVertexNormals();
            const wingMesh = new THREE.Mesh(
                wingGeom,
                new THREE.MeshPhongMaterial({ color: 0x6F5337, side: THREE.DoubleSide })
            );
            airplane.add(bodyMesh);
            airplane.add(wingMesh);
            return airplane;
        };
        const airplane = createAirplane();
        scene.add(airplane);
        airplane.scale.set(0.8, 0.8, 0.8);
        // Procedural Clouds construction with right-to-left gradient fade
        // Leftmost color: #EAE4DF, Rightmost color: #A29990
        const leftRGB = { r: 234/255, g: 228/255, b: 223/255 };
        const rightRGB = { r: 162/255, g: 153/255, b: 144/255 };
        const createCloud = (clusterX) => {
            const cloud = new THREE.Group();
            
            // Normalize clusterX between -15 and 15 to calculate interpolation factor t
            let t = (clusterX - (-15)) / 30;
            t = Math.max(0, Math.min(1, t)); // clamp to 0..1
            // Interpolate color values
            const baseR = leftRGB.r + (rightRGB.r - leftRGB.r) * t;
            const baseG = leftRGB.g + (rightRGB.g - leftRGB.g) * t;
            const baseB = leftRGB.b + (rightRGB.b - leftRGB.b) * t;
            // Generate slight color variation (multiple shade / 1-2 point here and there)
            const jitterR = (Math.random() - 0.5) * 0.05;
            const jitterG = (Math.random() - 0.5) * 0.05;
            const jitterB = (Math.random() - 0.5) * 0.05;
            const nBlobs = 3 + Math.floor(Math.random() * 5);
            for (let i = 0; i < nBlobs; i++) {
                // Per-blob subtle color shift
                const blobJitter = (Math.random() - 0.5) * 0.02;
                const blobColor = new THREE.Color(
                    Math.max(0, Math.min(1, baseR + jitterR + blobJitter)),
                    Math.max(0, Math.min(1, baseG + jitterG + blobJitter)),
                    Math.max(0, Math.min(1, baseB + jitterB + blobJitter))
                );
                const blobMat = new THREE.MeshPhongMaterial({
                    color: blobColor,
                    flatShading: true,
                });
                const blob = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.4, 0),
                    blobMat
                );
                blob.position.set(
                    i * 0.5 + Math.random() * 0.3,
                    Math.random() * 0.4,
                    Math.random() * 0.4
                );
                blob.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    0
                );
                blob.scale.setScalar(0.6 + Math.random() * 0.5);
                cloud.add(blob);
            }
            return cloud;
        };
        const createCloudCluster = (clusterX) => {
            const cluster = new THREE.Group();
            const count = 6 + Math.floor(Math.random() * 4);
            for (let i = 0; i < count; i++) {
                const cloud = createCloud(clusterX);
                cloud.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 5 - 5
                );
                cloud.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    0
                );
                cluster.add(cloud);
            }
            return cluster;
        };
        const world = new THREE.Group();
        scene.add(world);
        for (let i = 0; i < 8; i++) {
            const clusterX = (Math.random() - 0.5) * 30;
            const cluster = createCloudCluster(clusterX);
            cluster.position.set(
                clusterX,
                (Math.random() - 0.5) * 8,
                -Math.random() * 20 - 5
            );
            world.add(cluster);
        }
        // Lighting
        const hemisphereLight = new THREE.HemisphereLight(0xb2aaa1,0xb4aca4, 0.4);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(5, 10, 7);
        const ambientLight = new THREE.AmbientLight(0xe8e0d8, 0.5);
        scene.add(hemisphereLight);
        scene.add(dirLight);
        scene.add(ambientLight);
        const clock = new THREE.Clock();
        let rafId;
        // Render loop
        const animate = () => {
            const time = clock.getElapsedTime();
            const px = pointer.x;
            const py = pointer.y;
            // Tilt airplane based on pointer coordinate state
            airplane.rotation.z = THREE.MathUtils.lerp(
                airplane.rotation.z, px * 0.3, 0.05
            );
            airplane.rotation.x = THREE.MathUtils.lerp(
                airplane.rotation.x, py * 0.2, 0.05
            );
            // Gentle hovering float behavior
            airplane.position.y = Math.sin(time * 0.8) * 0.3;
            // Move the world container slightly in opposition to mouse coordinates
            world.position.x = THREE.MathUtils.lerp(
                world.position.x, px * 2, 0.03
            );
            world.position.y = THREE.MathUtils.lerp(
                world.position.y, py * 0.5, 0.03
            );
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        };
        animate();
        // Window resize event handler
        const handleResize = () => {
            aspect = window.innerWidth / window.innerHeight;
            camera.left = -d * aspect;
            camera.right = d * aspect;
            camera.top = d;
            camera.bottom = -d;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
    };
    // Initialize Hero 3D Canvas
    initHero3D();
    // --- 8. GSAP SCROLLTRIGGER FOR EDUCATION TIMELINE ---
    const initEducationGSAP = () => {

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        gsap.set('.timeline__item', {
            transformOrigin: 'center center'
        });

        gsap.utils.toArray('.timeline__item').forEach((item) => {

            gsap.fromTo(
                item,
                {
                    y: 100,
                    scale: 0.5,
                    opacity: 0
                },
                {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                        end: "top 40%",
                        scrub: 1
                    }
                }
            );

        });

        gsap.fromTo(
            '.timeline__image',
            {
                scale: 1.15
            },
            {
                scale: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.timeline',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );

        gsap.fromTo(
            '.timeline__caption',
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    toggleActions: "play reverse play reverse"
                    
                }
            }
        );

        ScrollTrigger.refresh();
    };
    // Initialize GSAP scroll animations
    window.addEventListener('load', () => {
    initEducationGSAP();

    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 300);
});
})