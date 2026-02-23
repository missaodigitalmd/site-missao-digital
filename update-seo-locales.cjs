const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src', 'i18n', 'locales');

const seoData = {
    pt: {
        imersao: {
            seo: {
                title: "Imersão Missão Digital | Capacite sua Igreja no Evangelismo Gamer",
                description: "Um programa intensivo prático para pastores e líderes. Aprenda como engajar novas gerações e implementar discipulado no mundo digital e nos eSports."
            }
        },
        'quem-somos': {
            seo: {
                title: "Quem Somos | Missão Digital – O Novo Campo Missionário",
                description: "Somos uma organização cristã focada em despertar e equipar a Igreja local para o vasto campo missionário digital. Conheça nossa visão e equipe."
            }
        },
        projetos: {
            seo: {
                title: "Nossos Projetos | Estratégia Prática de Evangelismo Digital",
                description: "Conheça iniciativas como D&D, Nínive e a Gank. Ferramentas e comunidades criadas para sua igreja atuar com extrema relevância no ecossistema gamer.",
                campeonato: {
                    title: "Campeonatos Cristãos de E-Sports | Evangelismo Estratégico",
                    description: "Conectando a paixão pelos eSports ao Reino de Deus. Descubra como usamos campeonatos de jogos virtuais como isca e pontes para o Evangelho."
                },
                daod: {
                    title: "Projeto D&D | Discipulado e Desenvolvimento de Gamers Cristãos",
                    description: "Conheça o projeto voltado ao cuidado espiritual no ambiente competitivo. Uma rede de suporte para crentes inseridos no cenário de jogos eletrônicos."
                },
                gank: {
                    title: "A Gank | Comunidade Gamer Cristã e Missional",
                    description: "Promovendo conexão genuína online. A Gank é o ponto de encontro seguro onde gamers encontram a Palavra e a Graça em meio às partidais virtuais."
                },
                ninive: {
                    title: "Projeto Nínive | Evangelismo na Cultura Pop e Nerd",
                    description: "Um olhar missionário para a cultura Pop, Anime e Geek. Entenda como o Projeto Nínive treina cristãos para serem luz nesses eventos e comunidades."
                }
            }
        },
        recursos: {
            seo: {
                title: "Recursos e Ferramentas | Biblioteca da Missão Digital",
                description: "Acesse e-books, tutoriais e guias completos para fundamentar e instrumentalizar o ministério de jovens e a liderança da sua igreja online."
            }
        },
        apoie: {
            seo: {
                title: "Seja um Parceiro da Missão Digital | Invista no Evangelismo Jovem",
                description: "Junte-se a nós para levar o Evangelho ao mundo digital. Seja um parceiro financeiro e ajude a estruturar a maior rede cristã no cenário gamer."
            }
        },
        contato: {
            seo: {
                title: "Fale Conosco | Missão Digital",
                description: "Queremos ajudar a sua igreja local. Entre em contato para parcerias, convites ou palestras sobre missões entre as comunidades digitais."
            }
        }
    },
    en: {
        imersao: {
            seo: {
                title: "Digital Mission Immersion | Equip Your Church for Gamer Evangelism",
                description: "A practical intensive program for pastors and leaders. Learn how to engage new generations and implement discipleship in the digital world and eSports."
            }
        },
        'quem-somos': {
            seo: {
                title: "About Us | Digital Mission – The New Mission Field",
                description: "We are a Christian organization focused on awakening and equipping the local Church for the vast digital mission field. Meet our vision and team."
            }
        },
        projetos: {
            seo: {
                title: "Our Projects | Practical Strategy for Digital Evangelism",
                description: "Discover initiatives like D&D, Nineveh, and The Gank. Tools and communities created for your church to act with extreme relevance in the gamer ecosystem.",
                campeonato: {
                    title: "Christian E-Sports Tournaments | Strategic Evangelism",
                    description: "Connecting the passion for eSports to the Kingdom of God. Discover how we use virtual gaming tournaments as bait and bridges to the Gospel."
                },
                daod: {
                    title: "D&D Project | Discipleship and Development of Christian Gamers",
                    description: "Discover the project aimed at spiritual care in the competitive environment. A support network for believers inserted in the electronic gaming scene."
                },
                gank: {
                    title: "The Gank | Christian and Missional Gamer Community",
                    description: "Promoting genuine online connection. The Gank is the safe meeting point where gamers find the Word and Grace amidst virtual matches."
                },
                ninive: {
                    title: "Nineveh Project | Evangelism in Pop and Nerd Culture",
                    description: "A missional look at Pop, Anime, and Geek culture. Understand how the Nineveh Project trains Christians to be light in these events and communities."
                }
            }
        },
        recursos: {
            seo: {
                title: "Resources and Tools | Digital Mission Library",
                description: "Access e-books, tutorials, and complete guides to establish and equip your church's youth ministry and leadership online."
            }
        },
        apoie: {
            seo: {
                title: "Partner with Digital Mission | Invest in Youth Evangelism",
                description: "Join us in bringing the Gospel to the digital world. Become a financial partner and help build the largest Christian network in the gamer scene."
            }
        },
        contato: {
            seo: {
                title: "Contact Us | Digital Mission",
                description: "We want to help your local church. Contact us for partnerships, invitations, or lectures on missions among digital communities."
            }
        }
    },
    es: {
        imersao: {
            seo: {
                title: "Inmersión Misión Digital | Capacita a tu Iglesia en el Evangelismo Gamer",
                description: "Un programa intensivo y práctico para pastores y líderes. Aprende cómo involucrar a las nuevas generaciones e implementar el discipulado en el mundo digital y los eSports."
            }
        },
        'quem-somos': {
            seo: {
                title: "Quiénes Somos | Misión Digital – El Nuevo Campo Misionero",
                description: "Somos una organización cristiana enfocada en despertar y equipar a la Iglesia local para el vasto campo misionero digital. Conoce nuestra visión y equipo."
            }
        },
        projetos: {
            seo: {
                title: "Nuestros Proyectos | Estrategia Práctica de Evangelismo Digital",
                description: "Descubre iniciativas como D&D, Nínive y La Gank. Herramientas y comunidades creadas para que tu iglesia actúe con extrema relevancia en el ecosistema gamer.",
                campeonato: {
                    title: "Torneos Cristianos de E-Sports | Evangelismo Estratégico",
                    description: "Conectando la pasión por los eSports con el Reino de Dios. Descubre cómo usamos los torneos de juegos virtuales como cebo y puentes hacia el Evangelio."
                },
                daod: {
                    title: "Proyecto D&D | Discipulado y Desarrollo de Gamers Cristianos",
                    description: "Conoce el proyecto orientado al cuidado espiritual en el entorno competitivo. Una red de apoyo para creyentes insertos en la escena de los juegos electrónicos."
                },
                gank: {
                    title: "La Gank | Comunidad Gamer Cristiana y Misional",
                    description: "Promoviendo conexiones genuinas en línea. La Gank es el punto de encuentro seguro donde los gamers encuentran la Palabra y la Gracia en medio de las partidas virtuales."
                },
                ninive: {
                    title: "Proyecto Nínive | Evangelismo en la Cultura Pop y Nerd",
                    description: "Una mirada misional a la cultura Pop, Anime y Geek. Entiende cómo el Proyecto Nínive entrena cristianos para ser luz en estos eventos y comunidades."
                }
            }
        },
        recursos: {
            seo: {
                title: "Recursos y Herramientas | Biblioteca de Misión Digital",
                description: "Accede a e-books, tutoriales y guías completas para fundamentar y equipar el ministerio de jóvenes y el liderazgo de tu iglesia en línea."
            }
        },
        apoie: {
            seo: {
                title: "Hazte Socio de Misión Digital | Invierte en el Evangelismo de Jóvenes",
                description: "Únete a nosotros para llevar el Evangelio al mundo digital. Conviértete en un socio financiero y ayuda a estructurar la mayor red cristiana en la escena gamer."
            }
        },
        contato: {
            seo: {
                title: "Contáctanos | Misión Digital",
                description: "Queremos ayudar a tu iglesia local. Contáctanos para alianzas, invitaciones o conferencias sobre misiones entre comunidades digitales."
            }
        }
    }
};

const languages = ['pt', 'en', 'es'];

languages.forEach(lang => {
    const langDir = Object.keys(seoData[lang]);

    langDir.forEach(fileKey => {
        const filePath = path.join(localesPath, lang, `${fileKey}.json`);

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            try {
                const json = JSON.parse(fileContent);
                // Injeta as propriedades de seo
                json.seo = seoData[lang][fileKey].seo;

                fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
                console.log(`Updated ${lang}/${fileKey}.json`);
            } catch (e) {
                console.error(`Error parsing ${lang}/${fileKey}.json: ${e.message}`);
            }
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    });
});

console.log('Update Complete.');
