class FullstackRoadmap {
  constructor() {
    this.currentStage = 0
    this.completedStages = new Set()
    this.completedSkills = new Set()
    this.totalStages = 0
    this.coins = 0
    this.level = 1

    this.stages = [
      {
        id: 1,
        title: "Fundamentos Básicos",
        icon: "🎯",
        description: "Conhecimentos essenciais para iniciar na área de tecnologia",
        skills: [
          "Conhecimento em Windows e Linux",
          "Pacote Office (Word, Excel, PowerPoint)",
          "Manutenção básica de hardware",
          "Protocolos TCP/IP básicos",
          "Noções de segurança da informação",
        ],
        percentage: 8,
        coins: 50,
      },
      {
        id: 2,
        title: "HTML & CSS",
        icon: "🎨",
        description: "Estrutura e estilização de páginas web",
        skills: [
          "HTML5 semântico",
          "CSS3 e Flexbox",
          "CSS Grid",
          "Responsive Design",
          "Animações CSS",
          "Preprocessadores (Sass/Less)",
        ],
        percentage: 15,
        coins: 75,
      },
      {
        id: 3,
        title: "JavaScript Básico",
        icon: "⚡",
        description: "Lógica de programação e JavaScript fundamentals",
        skills: [
          "Variáveis e tipos de dados",
          "Funções e escopo",
          "Arrays e objetos",
          "Loops e condicionais",
          "DOM manipulation",
          "Event handling",
        ],
        percentage: 25,
        coins: 100,
      },
      {
        id: 4,
        title: "JavaScript Avançado",
        icon: "🚀",
        description: "Conceitos avançados de JavaScript",
        skills: [
          "ES6+ features",
          "Promises e Async/Await",
          "Closures e Hoisting",
          "Prototypes e Classes",
          "Modules (Import/Export)",
          "Error handling",
        ],
        percentage: 35,
        coins: 125,
      },
      {
        id: 5,
        title: "React.js",
        icon: "⚛️",
        description: "Biblioteca para construção de interfaces",
        skills: [
          "Components e JSX",
          "Props e State",
          "Hooks (useState, useEffect)",
          "Context API",
          "React Router",
          "State Management",
        ],
        percentage: 45,
        coins: 150,
      },
      {
        id: 6,
        title: "Node.js & Express",
        icon: "🟢",
        description: "Backend com JavaScript",
        skills: [
          "Node.js fundamentals",
          "Express.js framework",
          "RESTful APIs",
          "Middleware",
          "File system operations",
          "NPM e package.json",
        ],
        percentage: 55,
        coins: 175,
      },
      {
        id: 7,
        title: "Banco de Dados",
        icon: "🗄️",
        description: "Armazenamento e gerenciamento de dados",
        skills: [
          "SQL básico",
          "PostgreSQL/MySQL",
          "MongoDB (NoSQL)",
          "ORMs (Prisma, Sequelize)",
          "Database design",
          "Migrations e seeds",
        ],
        percentage: 65,
        coins: 200,
      },
      {
        id: 8,
        title: "APIs & Integração",
        icon: "🔗",
        description: "Comunicação entre sistemas",
        skills: ["REST APIs", "GraphQL", "Authentication (JWT)", "API testing", "Third-party integrations", "Webhooks"],
        percentage: 75,
        coins: 225,
      },
      {
        id: 9,
        title: "DevOps & Deploy",
        icon: "☁️",
        description: "Deployment e infraestrutura",
        skills: [
          "Git e GitHub",
          "Docker básico",
          "CI/CD pipelines",
          "Cloud platforms (AWS, Vercel)",
          "Environment variables",
          "Monitoring e logs",
        ],
        percentage: 85,
        coins: 250,
      },
      {
        id: 10,
        title: "Ferramentas",
        icon: "🏗️",
        description: "Conhecimento em ligaguens de baixo nivel",
        skills: ["C,", "C++,", "C#", "GO", "Java"],
        percentage: 95,
        coins: 300,
      },
      {
        id: 11,
        title: "Frameworks Avançados",
        icon: "🏗️",
        description: "Ferramentas e frameworks modernos",
        skills: [
          "Next.js ou Nuxt.js",
          "TypeScript",
          "Testing (Jest, Cypress)",
          "State management avançado",
          "Performance optimization",
          "SEO e acessibilidade",
          "Spring boot",
        ],
        percentage: 95,
        coins: 300,
      },
      {
        id: 12,
        title: "Desenvolvedor Fullstack",
        icon: "👑",
        description: "Parabéns! Você é um desenvolvedor fullstack completo!",
        skills: [
          "Arquitetura de software",
          "Microservices",
          "Scalability",
          "Security best practices",
          "Code review e mentoria",
          "Continuous learning",
        ],
        percentage: 100,
        coins: 500,
      },
    ]

    this.totalStages = this.stages.length
    this.init()
  }

  init() {
    this.renderStages()
    this.setupEventListeners()
    this.updateProgress()
    this.loadProgress()
  }

  renderStages() {
    const worldMap = document.getElementById("worldMap")
    worldMap.innerHTML = ""

    this.stages.forEach((stage, index) => {
      const stageElement = this.createStageElement(stage, index)
      worldMap.appendChild(stageElement)
    })
  }

  createStageElement(stage, index) {
    const stageDiv = document.createElement("div")
    stageDiv.className = "stage"
    stageDiv.dataset.stageId = stage.id

    const isCompleted = this.completedStages.has(stage.id)
    const isLocked = index > this.currentStage
    const completedSkillsCount = stage.skills.filter((skill, i) => this.completedSkills.has(`${stage.id}-${i}`)).length
    const stageProgress = (completedSkillsCount / stage.skills.length) * 100

    if (isCompleted) {
      stageDiv.classList.add("completed")
    } else if (isLocked) {
      stageDiv.classList.add("locked")
    }

    const statusClass = isCompleted ? "status-completed" : isLocked ? "status-locked" : "status-available"
    const statusText = isCompleted ? "Concluída ✅" : isLocked ? "Bloqueada 🔒" : "Disponível 🎮"

    stageDiv.innerHTML = `
            <div class="stage-header">
                <div class="stage-icon">${stage.icon}</div>
                <div class="stage-info">
                    <h3>${stage.title}</h3>
                    <span class="stage-level">Fase ${stage.id}</span>
                </div>
            </div>
            <p class="stage-description">${stage.description}</p>
            <ul class="skills-list">
                ${stage.skills
                  .slice(0, 3)
                  .map((skill) => `<li>${skill}</li>`)
                  .join("")}
                ${stage.skills.length > 3 ? `<li>+${stage.skills.length - 3} mais...</li>` : ""}
            </ul>
            <div class="stage-progress">
                <div class="stage-progress-fill" style="width: ${isCompleted ? 100 : stageProgress}%"></div>
            </div>
            <div class="stage-status ${statusClass}">${statusText}</div>
        `

    if (!isLocked) {
      stageDiv.addEventListener("click", () => this.openStageModal(stage))
    }

    return stageDiv
  }

  openStageModal(stage) {
    const modal = document.getElementById("stageModal")
    const modalTitle = document.getElementById("modalTitle")
    const modalContent = document.getElementById("modalContent")
    const completeBtn = document.getElementById("completeStage")

    modalTitle.textContent = `${stage.icon} ${stage.title}`

    const isCompleted = this.completedStages.has(stage.id)
    const isAllSkillsCompleted = stage.skills.every((skill, i) => this.completedSkills.has(`${stage.id}-${i}`))

    modalContent.innerHTML = `
            <p style="margin-bottom: 20px; font-size: 1.1rem; color: #333;">
                ${stage.description}
            </p>
            <h4 style="margin-bottom: 15px; color: #333; font-family: 'Press Start 2P', cursive; font-size: 0.8rem;">
                🎯 Habilidades para dominar:
            </h4>
            <ul style="list-style: none; margin-bottom: 20px;">
                ${stage.skills
                  .map((skill, i) => {
                    const skillId = `${stage.id}-${i}`
                    const isSkillCompleted = this.completedSkills.has(skillId)
                    return `
                        <li class="skill-item ${isSkillCompleted ? "completed-skill" : ""}" data-skill-id="${skillId}">
                            ${isSkillCompleted ? "✅" : "⬜"} ${skill}
                        </li>
                    `
                  })
                  .join("")}
            </ul>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                <strong>Recompensa: ${stage.coins} moedas 🪙</strong><br>
                <small>Progresso: ${stage.percentage}% da jornada</small>
            </div>
        `

    completeBtn.textContent = isCompleted ? "Já Concluída ✅" : "Completar Fase 🏆"
    completeBtn.disabled = !isAllSkillsCompleted || isCompleted

    modalContent.querySelectorAll(".skill-item").forEach((skillItem) => {
      skillItem.addEventListener("click", (event) => {
        const skillId = event.currentTarget.dataset.skillId
        this.completeSkill(skillId)
      })
    })

    completeBtn.onclick = () => {
      if (!isCompleted && isAllSkillsCompleted) {
        this.completeStage(stage.id)
        modal.style.display = "none"
      }
    }

    modal.style.display = "block"
  }

  completeSkill(skillId) {
    if (this.completedSkills.has(skillId)) return

    this.completedSkills.add(skillId)
    this.saveProgress()
    this.updateProgress()
    this.renderStages()

    const [stageId, skillIndex] = skillId.split("-").map(Number)
    const stage = this.stages.find((s) => s.id === stageId)
    const completedSkillsCount = stage.skills.filter((skill, i) => this.completedSkills.has(`${stage.id}-${i}`)).length

    if (completedSkillsCount === stage.skills.length) {
      const modal = document.getElementById("stageModal")
      const completeBtn = document.getElementById("completeStage")
      completeBtn.disabled = false
      modal.querySelector(".stage-status").textContent = "Pronta para Completar!"
    }
  }

  completeStage(stageId) {
    if (this.completedStages.has(stageId)) return

    this.completedStages.add(stageId)
    const stage = this.stages.find((s) => s.id === stageId)

    this.coins += stage.coins
    this.level = Math.floor(this.coins / 100) + 1

    if (stageId === this.currentStage + 1) {
      this.currentStage = stageId
    }

    this.showAchievement(`Fase ${stageId} concluída! +${stage.coins} moedas`)

    this.updateProgress()
    this.renderStages()
    this.saveProgress()

    if (this.completedStages.size === this.totalStages) {
      setTimeout(() => {
        this.showAchievement("🎉 Parabéns! Você é um Desenvolvedor Fullstack! 🎉")
      }, 1000)
    }
  }

  updateProgress() {
    let totalCompletedPercentage = 0
    this.stages.forEach((stage) => {
      const completedSkillsCount = stage.skills.filter((skill, i) =>
        this.completedSkills.has(`${stage.id}-${i}`),
      ).length
      const stageProgress = (completedSkillsCount / stage.skills.length) * stage.percentage
      totalCompletedPercentage += stageProgress
    })

    const progressPercentage = totalCompletedPercentage
    const progressFill = document.getElementById("progressFill")
    const progressText = document.getElementById("progressText")
    const currentLevelEl = document.getElementById("currentLevel")
    const coinsEl = document.getElementById("coins")

    progressFill.style.width = `${progressPercentage}%`
    progressText.textContent = `${Math.round(progressPercentage)}%`
    currentLevelEl.textContent = this.level
    coinsEl.textContent = this.coins
  }

  calculateTotalProgress() {
    return 0
  }

  showAchievement(text) {
    const popup = document.getElementById("achievementPopup")
    const achievementText = document.getElementById("achievementText")

    achievementText.textContent = text
    popup.classList.add("show")

    setTimeout(() => {
      popup.classList.remove("show")
    }, 3000)
  }

  setupEventListeners() {
    const modal = document.getElementById("stageModal")
    const closeModal = document.getElementById("closeModal")

    closeModal.onclick = () => {
      modal.style.display = "none"
    }

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modal.style.display = "none"
      }
    })
  }

  saveProgress() {
    const progress = {
      currentStage: this.currentStage,
      completedStages: Array.from(this.completedStages),
      completedSkills: Array.from(this.completedSkills),
      coins: this.coins,
      level: this.level,
    }
    localStorage.setItem("fullstackProgress", JSON.stringify(progress))
  }

  loadProgress() {
    const saved = localStorage.getItem("fullstackProgress")
    if (saved) {
      const progress = JSON.parse(saved)
      this.currentStage = progress.currentStage || 0
      this.completedStages = new Set(progress.completedStages || [])
      this.completedSkills = new Set(progress.completedSkills || [])
      this.coins = progress.coins || 0
      this.level = progress.level || 1

      this.updateProgress()
      this.renderStages()
    }
  }

  resetProgress() {
    if (confirm("Tem certeza que deseja resetar todo o progresso?")) {
      this.currentStage = 0
      this.completedStages.clear()
      this.completedSkills.clear()
      this.level = 1

      localStorage.removeItem("fullstackProgress")
      this.updateProgress()
      this.renderStages()
      this.showAchievement("Progresso resetado! Boa sorte na nova jornada! 🎮")
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new FullstackRoadmap()

  const title = document.querySelector(".game-title")
  if (title) {
    title.addEventListener("dblclick", () => {
      game.resetProgress()
    })
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".stage:not(.locked)")) {
      const ripple = document.createElement("div")
      ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `

      const rect = e.target.closest(".stage").getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = e.clientX - rect.left - size / 2 + "px"
      ripple.style.top = e.clientY - rect.top - size / 2 + "px"

      e.target.closest(".stage").appendChild(ripple)

      setTimeout(() => ripple.remove(), 600)
    }
  })
})

const style = document.createElement("style")
style.textContent = `
    .skill-item {
        cursor: pointer;
        transition: background 0.3s ease;
    }
    .skill-item:hover {
        background: #e9ecef !important;
    }
    .completed-skill {
        text-decoration: line-through;
        color: #999;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)
