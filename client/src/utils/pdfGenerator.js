import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (clinical, patient, owner, followUps, logoUrl, veterinarian) => {
    const doc = jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- Header --
    if (logoUrl) {
        try {
            doc.addImage(logoUrl, 'PNG', 15, 10, 25, 25);
        } catch (e) {
            console.error("Error adding logo to PDF:", e);
        }
    }

    doc.setFontSize(20);
    doc.setTextColor(13, 59, 102); // #0d3b66
    doc.text('Soporte Equino', 45, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Gestión Veterinaria Inteligente', 45, 26);

    // -- Veterinarian Info (Right aligned or below logo) --
    if (veterinarian) {
        doc.setFontSize(9);
        doc.setTextColor(50);
        const vetName = `Dr(a). ${veterinarian.Nombre || ''} ${veterinarian.Apellido || ''}`;
        const vetDetails = [
            vetName,
            `Especialidad: ${veterinarian.Especialidad || 'Veterinario'}`,
            `Cédula: ${veterinarian.Cedula || 'N/A'}`,
            `Correo: ${veterinarian.Correo || 'N/A'}`,
            `Teléfono: ${veterinarian.Redes?.whatsapp || 'N/A'}`
        ];

        // Position on the right
        let rightY = 15;
        vetDetails.forEach(line => {
            doc.text(line, pageWidth - 15, rightY, { align: 'right' });
            rightY += 4;
        });
    }

    doc.setDrawColor(200);
    doc.line(15, 40, pageWidth - 15, 40);

    // -- Title --
    doc.setFontSize(14);
    doc.setTextColor(13, 59, 102);
    doc.text('HISTORIA CLÍNICA VETERINARIA', pageWidth / 2, 48, { align: 'center' });

    // -- Basic Info --
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('INFORMACIÓN GENERAL', 15, 55);

    const basicInfo = [
        ['Paciente:', patient?.Nombre || 'N/A', 'Registro:', patient?.Numero_registro || 'S/N'],
        ['Especie:', 'Equino', 'Género:', patient?.Sexo || 'N/A'],
        ['Propietario:', `${owner?.Nombre || ''} ${owner?.Apellido || ''}`, 'Teléfono:', owner?.Telefono || 'N/A'],
        ['Fecha Historia:', clinical.Fecha ? new Date(clinical.Fecha).toLocaleDateString() : 'N/A', 'ID Historia:', `#${clinical.idHistoria_clinica}`]
    ];

    autoTable(doc, {
        startY: 60,
        head: [],
        body: basicInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 30 }, 2: { fontStyle: 'bold', width: 30 } }
    });

    // -- Physical Exam --
    let currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('EXAMEN FÍSICO', 15, currentY);

    const physicalExam = [
        ['Vacunas:', clinical.Vacunas || 'N/A', 'Enfermedades:', clinical.Enfermedades || 'N/A'],
        ['Temperatura:', clinical.Temperatura || 'N/A', 'Pulso:', clinical.Pulso || 'N/A'],
        ['Frec. Cardiaca:', clinical.Frecuencia_cardiaca || 'N/A', 'Frec. Respiratoria:', clinical.Frecuencia_respiratoria || 'N/A'],
        ['Mucosas:', clinical.Mucosas || 'N/A', 'Llenado Capilar:', clinical.Llenado_capilar || 'N/A'],
        ['Pliegue Cutáneo:', clinical.Pliegue_cutaneo || 'N/A', 'Pulso Digital:', clinical.Pulso_digital || 'N/A']
    ];

    autoTable(doc, {
        startY: currentY + 5,
        body: physicalExam,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [13, 59, 102] },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 240, 240] }, 2: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
    });

    // -- Systems & Diagnosis --
    currentY = doc.lastAutoTable.finalY + 10;

    const systems = [
        ['Anamnesis:', clinical.Anamnesis || 'N/A'],
        ['Evaluación Distancia:', clinical.Evaluacion_distancia || 'N/A'],
        ['Aspecto General:', clinical.Aspecto || 'N/A'],
        ['Locomotor:', clinical.Locomotor || 'N/A'],
        ['Digestivo:', clinical.Digestivo || 'N/A'],
        ['Diagnóstico:', clinical.Diagnostico_integral || 'N/A'],
        ['Tratamiento:', clinical.Tratamiento || 'N/A'],
        ['Observaciones:', clinical.Observaciones || 'N/A']
    ];

    autoTable(doc, {
        startY: currentY,
        body: systems,
        theme: 'striped',
        styles: { fontSize: 9, overflow: 'linebreak' },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    // -- Photo --
    currentY = doc.lastAutoTable.finalY + 10;
    if (clinical.Foto) {
        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }
        try {
            doc.setFontSize(10);
            doc.text('REGISTRO FOTOGRÁFICO', 15, currentY);
            doc.addImage(clinical.Foto, 'JPEG', 15, currentY + 5, 80, 80);
            currentY += 95;
        } catch (e) {
            console.error("Error adding clinical photo to PDF:", e);
        }
    }

    // -- Follow ups --
    if (followUps && followUps.length > 0) {
        if (currentY > 230) doc.addPage();
        else currentY += 5;

        doc.setFontSize(12);
        doc.text('SEGUIMIENTOS Y EVOLUCIÓN', 15, currentY);

        const followData = followUps.map(s => [
            new Date(s.Fecha).toLocaleDateString(),
            s.Descripcion,
            s.Tratamiento || '-',
            `${s.NombreVeterinario} ${s.ApellidoVeterinario}`
        ]);

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Fecha', 'Descripción', 'Tratamiento', 'Veterinario']],
            body: followData,
            theme: 'striped',
            headStyles: { fillColor: [13, 59, 102] },
            styles: { fontSize: 8 }
        });
    }

    // -- Footer --
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text('Generado por Soporte Equino - Gestión Veterinaria Inteligente', 15, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`Historia_${patient?.Nombre || 'Equino'}_${new Date().getTime()}.pdf`);
};
