/**
 * NPC Relationship Visualizations
 * Network graphs, family trees, and faction org charts
 *
 * @module npc-visualizations
 */

import { NPCManagerStorage } from './npc-manager-storage.js';
import { StringUtils } from '../utils.js';

export class NPCVisualizations {

  /**
   * Create relationship network graph
   * @param {HTMLElement} container
   * @param {Array<string>} npcIds - NPCs to include in graph
   */
  static createRelationshipGraph(container, npcIds = null) {
    // Get NPCs and relationships
    const allNPCs = NPCManagerStorage.getAllNPCs();
    const npcs = npcIds
      ? allNPCs.filter(npc => npcIds.includes(npc.id))
      : allNPCs;

    if (npcs.length === 0) {
      container.innerHTML = '<p class="empty-message">No NPCs to visualize</p>';
      return;
    }

    const allRelationships = NPCManagerStorage.getData().relationships;
    const npcIdSet = new Set(npcs.map(n => n.id));

    // Build nodes and links
    const nodes = npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      ancestry: npc.ancestry,
      color: npc.color || this.getColorForAncestry(npc.ancestry),
      pinned: npc.pinned,
      archived: npc.archived
    }));

    const links = allRelationships
      .filter(rel => npcIdSet.has(rel.npc1) && npcIdSet.has(rel.npc2))
      .map(rel => ({
        source: rel.npc1,
        target: rel.npc2,
        type: rel.type
      }));

    // Create SVG
    const width = container.clientWidth;
    const height = Math.max(400, container.clientHeight);

    container.innerHTML = ''; // Clear container

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.border = '1px solid var(--color-border-dark)';
    svg.style.background = 'var(--color-bg)';
    container.appendChild(svg);

    // Simple force-directed layout (basic implementation without D3)
    this.renderForceDirectedGraph(svg, nodes, links, width, height);
  }

  /**
   * Render force-directed graph (simplified without D3.js)
   * @param {SVGElement} svg
   * @param {Array} nodes
   * @param {Array} links
   * @param {number} width
   * @param {number} height
   */
  static renderForceDirectedGraph(svg, nodes, links, width, height) {
    // Initialize node positions randomly
    nodes.forEach(node => {
      node.x = Math.random() * (width - 100) + 50;
      node.y = Math.random() * (height - 100) + 50;
      node.vx = 0;
      node.vy = 0;
    });

    // Create node lookup
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Create links SVG elements
    const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linksGroup.setAttribute('class', 'links');
    svg.appendChild(linksGroup);

    links.forEach(link => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#888');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-opacity', '0.6');
      link.element = line;
      linksGroup.appendChild(line);
    });

    // Create nodes SVG elements
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'nodes');
    svg.appendChild(nodesGroup);

    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'node');
      group.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', node.pinned ? '12' : '8');
      circle.setAttribute('fill', node.color);
      circle.setAttribute('stroke', node.archived ? '#999' : '#fff');
      circle.setAttribute('stroke-width', '2');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = node.name;
      text.setAttribute('dy', '-15');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--color-text-dark-primary)');
      text.setAttribute('font-size', '11px');

      group.appendChild(circle);
      group.appendChild(text);
      nodesGroup.appendChild(group);

      node.element = group;
      node.circle = circle;

      // Add drag handling
      let isDragging = false;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      group.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - node.x;
        dragOffsetY = e.clientY - node.y;
        e.preventDefault();
      });

      svg.addEventListener('mousemove', (e) => {
        if (isDragging) {
          node.x = e.clientX - dragOffsetX;
          node.y = e.clientY - dragOffsetY;
          updatePositions();
        }
      });

      svg.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Click handler
      group.addEventListener('click', () => {
        // Trigger NPC detail view
        const event = new CustomEvent('npc-node-click', { detail: { npcId: node.id } });
        svg.dispatchEvent(event);
      });
    });

    // Simple physics simulation
    let iterations = 0;
    const maxIterations = 300;

    const simulate = () => {
      if (iterations++ > maxIterations) return;

      // Apply forces
      nodes.forEach(node => {
        // Repulsion between nodes
        nodes.forEach(other => {
          if (node.id === other.id) return;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 150) {
            const force = (150 - dist) / dist * 0.5;
            node.vx += dx * force;
            node.vy += dy * force;
          }
        });

        // Attraction to center
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        // Damping
        node.vx *= 0.9;
        node.vy *= 0.9;
      });

      // Link attraction
      links.forEach(link => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);

        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 80) / dist * 0.1;

        source.vx += dx * force;
        source.vy += dy * force;
        target.vx -= dx * force;
        target.vy -= dy * force;
      });

      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      });

      updatePositions();

      if (iterations < maxIterations) {
        requestAnimationFrame(simulate);
      }
    };

    const updatePositions = () => {
      // Update node positions
      nodes.forEach(node => {
        if (node.element) {
          node.element.setAttribute('transform', `translate(${node.x},${node.y})`);
        }
      });

      // Update link positions
      links.forEach(link => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);

        if (source && target && link.element) {
          link.element.setAttribute('x1', source.x);
          link.element.setAttribute('y1', source.y);
          link.element.setAttribute('x2', target.x);
          link.element.setAttribute('y2', target.y);
        }
      });
    };

    // Start simulation
    simulate();
  }

  /**
   * Create family tree visualization
   * @param {HTMLElement} container
   * @param {string} familyId
   */
  static createFamilyTree(container, familyId) {
    const family = NPCManagerStorage.getFamily(familyId);
    if (!family) {
      container.innerHTML = '<p class="empty-message">Family not found</p>';
      return;
    }

    // Get all NPCs in this family
    const allNPCs = NPCManagerStorage.getAllNPCs();
    const familyNPCs = allNPCs.filter(npc => {
      const families = NPCManagerStorage.getFamiliesForNPC(npc.id);
      return families.some(f => f.id === familyId);
    });

    if (familyNPCs.length === 0) {
      container.innerHTML = '<p class="empty-message">No NPCs in this family</p>';
      return;
    }

    // For now, render as a simple hierarchical list
    // A full family tree would require more complex layout
    let html = `<div class="family-tree">`;
    html += `<h3>${StringUtils.escapeHTML(family.surname)} Family</h3>`;
    html += `<div class="family-members">`;

    familyNPCs.forEach(npc => {
      const role = family.members?.find(m => m.npcId === npc.id)?.role || 'Member';
      html += `
        <div class="family-member" data-npc-id="${npc.id}">
          <div class="member-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="member-info">
            <strong>${StringUtils.escapeHTML(npc.name)}</strong>
            <span>${StringUtils.escapeHTML(role)}</span>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.family-member').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const npcId = el.dataset.npcId;
        const event = new CustomEvent('npc-node-click', { detail: { npcId } });
        container.dispatchEvent(event);
      });
    });
  }

  /**
   * Create faction org chart
   * @param {HTMLElement} container
   * @param {string} factionId
   */
  static createFactionOrgChart(container, factionId) {
    const faction = NPCManagerStorage.getFaction(factionId);
    if (!faction) {
      container.innerHTML = '<p class="empty-message">Faction not found</p>';
      return;
    }

    // Get all NPCs in this faction
    const allNPCs = NPCManagerStorage.getAllNPCs();
    const factionNPCs = allNPCs.filter(npc => {
      const factions = NPCManagerStorage.getFactionsForNPC(npc.id);
      return factions.some(f => f.id === factionId);
    });

    if (factionNPCs.length === 0) {
      container.innerHTML = '<p class="empty-message">No NPCs in this faction</p>';
      return;
    }

    // Organize by rank
    const ranks = new Map();
    factionNPCs.forEach(npc => {
      const member = faction.members?.find(m => m.npcId === npc.id);
      const rank = member?.rank || 'Member';
      if (!ranks.has(rank)) {
        ranks.set(rank, []);
      }
      ranks.get(rank).push(npc);
    });

    // Render org chart
    let html = `<div class="faction-org-chart">`;
    html += `<h3>${StringUtils.escapeHTML(faction.name)}</h3>`;
    html += `<p class="faction-type">${StringUtils.escapeHTML(faction.type?.name || 'Organization')}</p>`;

    ranks.forEach((npcs, rank) => {
      html += `<div class="org-rank">`;
      html += `<h4>${StringUtils.escapeHTML(rank)}</h4>`;
      html += `<div class="rank-members">`;

      npcs.forEach(npc => {
        html += `
          <div class="faction-member" data-npc-id="${npc.id}">
            <i class="fas fa-user"></i>
            <span>${StringUtils.escapeHTML(npc.name)}</span>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.faction-member').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const npcId = el.dataset.npcId;
        const event = new CustomEvent('npc-node-click', { detail: { npcId } });
        container.dispatchEvent(event);
      });
    });
  }

  /**
   * Create timeline visualization
   * @param {HTMLElement} container
   * @param {Array} encounters - Encounter data
   */
  static createTimeline(container, encounters) {
    if (!encounters || encounters.length === 0) {
      container.innerHTML = '<p class="empty-message">No encounters to visualize</p>';
      return;
    }

    // Sort encounters by date
    const sorted = encounters.sort((a, b) =>
      (a.savedAt || 0) - (b.savedAt || 0)
    );

    let html = `<div class="encounter-timeline">`;

    sorted.forEach(encounter => {
      const date = encounter.savedAt
        ? new Date(encounter.savedAt).toLocaleDateString()
        : 'Unknown date';

      html += `
        <div class="timeline-item" data-encounter-id="${encounter.id}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">${StringUtils.escapeHTML(date)}</div>
            <div class="timeline-title">${StringUtils.escapeHTML(encounter.title || 'Untitled Encounter')}</div>
            <div class="timeline-description">${StringUtils.escapeHTML(encounter.description || '')}</div>
            ${encounter.location ? `<div class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${StringUtils.escapeHTML(encounter.location)}</div>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  /**
   * Get color for ancestry
   * @param {string} ancestry
   * @returns {string}
   */
  static getColorForAncestry(ancestry) {
    const colors = {
      human: '#8B4513',
      elf: '#90EE90',
      dwarf: '#A0522D',
      gnome: '#FFB6C1',
      halfling: '#F4A460',
      goblin: '#9ACD32',
      orc: '#8FBC8F',
      'half-elf': '#98D8C8',
      'half-orc': '#A0A07B',
      default: '#778899'
    };

    return colors[ancestry?.toLowerCase()] || colors.default;
  }
}
