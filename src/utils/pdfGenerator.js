import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MASTER_GROUPS, formatBagsDisplay } from './constants';

export function generateAuditPdf({
  fpsId,
  metadata = {},
  groupedData = {},
  totalRiceSummary = {},
  globalBagWeight = 50
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for number formatting (Indian locale standard)
  const fmt = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // --- 1. Official Kerala Government Header ---
  doc.setFillColor(30, 58, 138); // Deep Navy Blue (#1e3a8a)
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('GOVERNMENT OF KERALA', pageWidth / 2, 8, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF FOOD, CIVIL SUPPLIES & CONSUMER AFFAIRS', pageWidth / 2, 13.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 235, 255);
  doc.text('FPS PHYSICAL STOCK AUDIT & ePOS RECONCILIATION REPORT', pageWidth / 2, 19, { align: 'center' });

  // --- 2. Metadata Box (Two-Column Balanced Grid with Strict Width Budget) ---
  let y = 28;
  const boxW = pageWidth - 22; // 188mm wide (margins 11mm on each side)
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(11, y, boxW, 28, 2, 2, 'FD');

  // Vertical divider between columns
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(105, y + 3, 105, y + 25);

  // Left column layout
  const leftLabelX = 15;
  const leftValX = 45;
  const maxLeftValW = 58;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text('FPS / ARD Code:', leftLabelX, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${fpsId} - ${metadata.shop_name || 'Ration Shop'}`, leftValX, y + 6, { maxWidth: maxLeftValW });

  doc.setFont('helvetica', 'bold');
  doc.text('District / TSO:', leftLabelX, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${metadata.district || 'Malappuram'} / ${metadata.tso || 'Ponnani Firka'}`, leftValX, y + 12, { maxWidth: maxLeftValW });

  doc.setFont('helvetica', 'bold');
  doc.text('Std Bag Weight:', leftLabelX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${globalBagWeight} kg / bag`, leftValX, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Date & Time:', leftLabelX, y + 24);
  doc.setFont('helvetica', 'normal');
  const inspectDate = metadata.inspectionDate || new Date().toISOString().split('T')[0];
  const inspectTime = metadata.inspectionTime || new Date().toLocaleTimeString().slice(0, 5);
  doc.text(`${inspectDate} at ${inspectTime}`, leftValX, y + 24);

  // Right column layout
  const rightLabelX = 108;
  const rightValX = 138;
  const maxRightValW = 58;

  doc.setFont('helvetica', 'bold');
  doc.text('Inspecting Officer:', rightLabelX, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${metadata.inspectorName || 'Rationing Inspector'}`, rightValX, y + 6, { maxWidth: maxRightValW });

  doc.setFont('helvetica', 'bold');
  doc.text('Designation:', rightLabelX, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${metadata.inspectorDesignation || 'Rationing Inspector, Ponnani Firka'}`, rightValX, y + 12, { maxWidth: maxRightValW });

  doc.setFont('helvetica', 'bold');
  doc.text('Report Ref No:', rightLabelX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`AUDIT-${fpsId}-${new Date().getTime().toString().slice(-6)}`, rightValX, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Status:', rightLabelX, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.text('Reconciliation Completed', rightValX, y + 24);

  // --- 3. Itemized Commodity Reconciliation Table (10 Columns, Precisely Measured) ---
  y += 33;

  const tableHeaders = [
    [
      'Sl', 
      'Inspection Group', 
      'Unit', 
      'ePOS Stock\n(Kg / Unit)', 
      'Bags\n(Count)', 
      'Stack Stock\n(Kg)', 
      'Loose Stock\n(Kg)', 
      'Total Physical\n(Kg / Unit)', 
      'Difference\n(Kg / Unit)', 
      'Status'
    ]
  ];

  const tableRows = [];
  let sl = 1;

  const groupOrder = [MASTER_GROUPS.RICE, MASTER_GROUPS.WHEAT, MASTER_GROUPS.ATTA, MASTER_GROUPS.OTHER];

  groupOrder.forEach(groupName => {
    const group = groupedData[groupName];
    if (!group || !group.items || group.items.length === 0) return;

    // Filter out items that have neither system stock nor physical count
    const activeItems = group.items.filter(item => (item.systemStockKg || 0) > 0 || (item.totalPhysicalKg || 0) > 0);
    if (activeItems.length === 0) return;

    // Group Category Header Row (spans all 10 columns)
    tableRows.push([
      { 
        content: `CATEGORY: ${groupName.toUpperCase()}`, 
        colSpan: 10, 
        styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [15, 23, 42] } 
      }
    ]);

    activeItems.forEach(item => {
      const diffVal = Math.round((item.differenceKg || 0) * 100) / 100;
      let statusStr = 'MATCH';
      if (diffVal > 0) statusStr = 'EXCESS';
      else if (diffVal < 0) statusStr = 'SHORTAGE';

      let label = item.commodity;
      if (item.subItems && item.subItems.length > 1) {
        label += `\n[ePOS: ${item.subItems.map(s => `${s.name}: ${fmt(s.kg)}`).join(', ')}]`;
      }

      tableRows.push([
        sl++,
        label,
        item.unit || 'Kgs',
        fmt(item.systemStockKg),
        item.totalBags > 0 ? formatBagsDisplay(item.totalBags, true) : '0',
        fmt(item.stackStockKg),
        fmt(item.looseKg),
        fmt(item.totalPhysicalKg),
        (diffVal > 0 ? '+' : '') + fmt(diffVal),
        statusStr
      ]);
    });

    // Group Subtotal Row (3 columns header + 7 columns numbers)
    const t = group.totals;
    const gDiff = Math.round((t.differenceKg || 0) * 100) / 100;
    const gDiffStr = (gDiff > 0 ? '+' : '') + fmt(gDiff);
    const gStatusStr = gDiff === 0 ? 'BALANCED' : gDiff > 0 ? 'EXCESS' : 'DEFICIT';

    tableRows.push([
      { 
        content: `Subtotal (${groupName}):`, 
        colSpan: 3, 
        styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } 
      },
      { content: fmt(t.systemStockKg), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: formatBagsDisplay(t.totalBags, true), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmt(t.stackStockKg), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmt(t.looseKg), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmt(t.totalPhysicalKg), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: gDiffStr, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: gStatusStr, styles: { fontStyle: 'bold', halign: 'center', fillColor: [241, 245, 249] } }
    ]);
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 11, right: 11 },
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 19, halign: 'right' },
      4: { cellWidth: 12, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 21, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 19, halign: 'right', fontStyle: 'bold' },
      9: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        const row = data.row.raw;
        if (Array.isArray(row) && row.length === 10) {
          const diffStr = row[8];
          const diffNum = parseFloat(diffStr);
          if (data.column.index === 8 || data.column.index === 9) {
            if (diffNum === 0 || isNaN(diffNum)) {
              data.cell.styles.fillColor = [209, 250, 229]; // Soft Pastel Green
              data.cell.styles.textColor = [6, 95, 70];
            } else if (diffNum > 0) {
              data.cell.styles.fillColor = [219, 234, 254]; // Soft Pastel Blue
              data.cell.styles.textColor = [30, 64, 175];
            } else {
              data.cell.styles.fillColor = [254, 226, 226]; // Soft Pastel Red
              data.cell.styles.textColor = [153, 27, 27];
            }
          }
        }
      }
    }
  });

  // Calculate position after table
  let finalY = doc.lastAutoTable.finalY + 4;

  // --- 4. Total Rice Master Summary Box ---
  // Ensure enough room for Total Rice Box (24mm) + footer clearance
  if (finalY + 26 > pageHeight - 35) {
    doc.addPage();
    finalY = 16;
  }

  const riceBoxY = finalY;
  doc.setFillColor(239, 246, 255); // Soft Blue-50
  doc.setDrawColor(147, 197, 253); // Blue-300
  doc.roundedRect(11, riceBoxY, boxW, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL RICE AGGREGATION SUMMARY (CMR + RAW + BOILED + SPL RICE)', 15, riceBoxY + 5.5);

  doc.setFontSize(8);

  // Row 1: System ePOS Stock (Left) & Physical Stack Count (Right)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• System ePOS Stock:', 15, riceBoxY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${fmt(totalRiceSummary?.systemStockKg)} kg`, 48, riceBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Physical Count:', 105, riceBoxY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  const countText = `${formatBagsDisplay(totalRiceSummary?.totalBags || 0, true)} bags (${fmt(totalRiceSummary?.stackStockKg)} kg) + Loose ${fmt(totalRiceSummary?.looseKg)} kg`;
  doc.text(countText, 133, riceBoxY + 12, { maxWidth: 62 });

  // Row 2: Total Physical Stock (Left) & Net Reconciliation (Right)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Total Physical Stock:', 15, riceBoxY + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${fmt(totalRiceSummary?.totalPhysicalKg)} kg`, 48, riceBoxY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Net Reconciliation:', 105, riceBoxY + 19);
  doc.setFont('helvetica', 'bold');

  const riceDiff = Math.round((totalRiceSummary?.differenceKg || 0) * 100) / 100;
  if (riceDiff === 0) {
    doc.setTextColor(6, 95, 70);
    doc.text('0.00 kg (BALANCED)', 133, riceBoxY + 19);
  } else if (riceDiff > 0) {
    doc.setTextColor(30, 64, 175);
    doc.text(`+${fmt(riceDiff)} kg (EXCESS)`, 133, riceBoxY + 19);
  } else {
    doc.setTextColor(153, 27, 27);
    doc.text(`${fmt(riceDiff)} kg (SHORTAGE / DEFICIT)`, 133, riceBoxY + 19);
  }

  finalY = riceBoxY + 28;

  // --- 5. Inspecting Officer Remarks Box ---
  if (metadata.remarks) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const remarksLines = doc.splitTextToSize(metadata.remarks, boxW - 8);
    const remHeight = Math.max(12, remarksLines.length * 4 + 7);

    // Page break check if remarks doesn't fit
    if (finalY + remHeight + 35 > pageHeight) {
      doc.addPage();
      finalY = 16;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(11, finalY, boxW, remHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Inspecting Officer Remarks / Observations:', 15, finalY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(remarksLines, 15, finalY + 9);

    finalY += remHeight + 4;
  }

  // --- 6. Official Signatures & Seal Block ---
  const sigNeededSpace = 28;
  if (finalY + sigNeededSpace + 10 > pageHeight) {
    doc.addPage();
    finalY = 16;
  } else {
    // Pin signature neatly above footer
    finalY = Math.max(finalY + 4, pageHeight - 38);
  }

  // Left Signature: ARD Dealer
  doc.setDrawColor(100, 116, 139);
  doc.line(15, finalY + 10, 75, finalY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Signature & Seal of ARD Dealer', 15, finalY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`ARD No: ${fpsId} - ${metadata.shop_name || 'Ration Shop'}`, 15, finalY + 18, { maxWidth: 65 });
  doc.text(`${metadata.district || 'Malappuram'} / ${metadata.tso || 'Ponnani'}`, 15, finalY + 22, { maxWidth: 65 });

  // Right Signature: Inspecting Officer
  doc.line(pageWidth - 75, finalY + 10, pageWidth - 15, finalY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Signature of Inspecting Officer', pageWidth - 75, finalY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`${metadata.inspectorName || 'Rationing Inspector'}`, pageWidth - 75, finalY + 18, { maxWidth: 60 });
  doc.text(`${metadata.inspectorDesignation || 'Rationing Inspector, Ponnani Firka'}`, pageWidth - 75, finalY + 22, { maxWidth: 60 });

  // --- 7. Digital Certified Footer (Across All Pages) ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Government of Kerala • Department of Food, Civil Supplies & Consumer Affairs • Certified Digital FPS Audit Record',
      pageWidth / 2,
      pageHeight - 4,
      { align: 'center' }
    );
    if (totalPages > 1) {
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 12, pageHeight - 4, { align: 'right' });
    }
  }

  // --- 8. Download PDF ---
  const filename = `FPS_Audit_Report_${fpsId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
