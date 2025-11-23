package com.ifsp.service;

import com.ifsp.model.Matricula;
import com.ifsp.model.Nota;
import com.ifsp.model.StatusMatricula;
import com.ifsp.model.Turma;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*; 
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class RelatorioService {

    @Autowired
    private GestaoNotasService gestaoNotasService;

    // Gerar Excel (Apache POI)
    public byte[] gerarExcelRelatorioTurma(Integer turmaId, String professorEmail) throws IOException {
        List<Matricula> matriculas = gestaoNotasService.findMatriculasByTurma(turmaId, professorEmail);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // RESUMO
            Sheet resumoSheet = workbook.createSheet("Resumo da Turma");
            criarCabecalhoResumoExcel(resumoSheet, workbook);
            
            int rowNumResumo = 1;
            for (Matricula m : matriculas) {
                Row row = resumoSheet.createRow(rowNumResumo++);
                row.createCell(0).setCellValue(m.getAluno().getId());
                row.createCell(1).setCellValue(m.getAluno().getNome());
                setCellValorDecimal(row.createCell(2), m.getMediaFinal());
                setCellValorDecimal(row.createCell(3), m.getFrequencia());
                setCellValorStatus(row.createCell(4), m.getStatus());
            }
            for(int i = 0; i < 5; i++) resumoSheet.autoSizeColumn(i);

            // DETALHES
            Sheet detalheSheet = workbook.createSheet("Notas Detalhadas");
            criarCabecalhoDetalhesExcel(detalheSheet, workbook);

            int rowNumDetalhe = 1;
            for (Matricula m : matriculas) {
                List<Nota> notas = gestaoNotasService.findNotasByMatricula(m.getId(), professorEmail);
                for (Nota n : notas) {
                    Row row = detalheSheet.createRow(rowNumDetalhe++);
                    row.createCell(0).setCellValue(m.getId());
                    row.createCell(1).setCellValue(m.getAluno().getNome());
                    row.createCell(2).setCellValue(n.getDescricao());
                    setCellValorDecimal(row.createCell(3), n.getValorNota());
                    setCellValorDecimal(row.createCell(4), n.getPeso());
                    if (n.getDataAvaliacao() != null) {
                        row.createCell(5).setCellValue(n.getDataAvaliacao().toString());
                    }
                }
            }
            for(int i = 0; i < 6; i++) detalheSheet.autoSizeColumn(i);

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    // Gerar PDF (iText 7)
    public byte[] gerarPdfRelatorioTurma(Integer turmaId, String professorEmail) {
        List<Matricula> matriculas = gestaoNotasService.findMatriculasByTurma(turmaId, professorEmail);
        Turma turma = matriculas.isEmpty() ? null : matriculas.get(0).getTurma();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            Text titulo = new Text("Relatório de Notas - IFSP").setFont(fontBold).setFontSize(18);
            document.add(new Paragraph().add(titulo).setTextAlignment(TextAlignment.CENTER));

            if (turma != null) {
                document.add(new Paragraph("Disciplina: " + turma.getDisciplina().getNome()));
                document.add(new Paragraph("Código: " + turma.getDisciplina().getCodigoDisciplina()));
                document.add(new Paragraph("Período: " + turma.getPeriodo()));
                document.add(new Paragraph("Professor: " + turma.getProfessor().getNome()));
            }
            document.add(new Paragraph("\n"));

            float[] columnWidths = {1, 4, 2, 2, 3};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            addHeaderCellPdf(table, "ID");
            addHeaderCellPdf(table, "Aluno");
            addHeaderCellPdf(table, "Média Final");
            addHeaderCellPdf(table, "Frequência");
            addHeaderCellPdf(table, "Status");

            for (Matricula m : matriculas) {
                table.addCell(new Cell().add(new Paragraph(m.getAluno().getId().toString())));
                table.addCell(new Cell().add(new Paragraph(m.getAluno().getNome())));
                
                String media = m.getMediaFinal() != null ? m.getMediaFinal().toString() : "-";
                table.addCell(new Cell().add(new Paragraph(media)).setTextAlignment(TextAlignment.CENTER));
                
                String freq = m.getFrequencia() != null ? m.getFrequencia().toString() + "%" : "-";
                table.addCell(new Cell().add(new Paragraph(freq)).setTextAlignment(TextAlignment.CENTER));
                
                String status = m.getStatus() != null ? m.getStatus().toString() : "-";
                table.addCell(new Cell().add(new Paragraph(status)));
            }

            document.add(table);
            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage());
        }
    }

    // Auxiliares PDF
    private void addHeaderCellPdf(Table table, String text) throws IOException {
        Cell cell = new Cell();
        
        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        
        cell.add(new Paragraph().add(new Text(text).setFont(fontBold)));
        
        cell.setBackgroundColor(ColorConstants.LIGHT_GRAY);
        cell.setTextAlignment(TextAlignment.CENTER);
        table.addCell(cell);
    }

    // Auxiliares Excel
    private void criarCabecalhoResumoExcel(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID Aluno", "Nome Aluno", "Média Final", "Frequência (%)", "Status"};
        CellStyle headerStyle = criarEstiloCabecalhoExcel(workbook);
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void criarCabecalhoDetalhesExcel(Sheet sheet, Workbook workbook) {
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID Matrícula", "Nome Aluno", "Descrição Avaliação", "Nota", "Peso", "Data"};
        CellStyle headerStyle = criarEstiloCabecalhoExcel(workbook);
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private CellStyle criarEstiloCabecalhoExcel(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        headerStyle.setFont(font);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return headerStyle;
    }

    private void setCellValorDecimal(org.apache.poi.ss.usermodel.Cell cell, BigDecimal valor) {
        if (valor != null) cell.setCellValue(valor.doubleValue());
        else cell.setBlank();
    }

    private void setCellValorStatus(org.apache.poi.ss.usermodel.Cell cell, StatusMatricula status) {
        if (status != null) cell.setCellValue(status.toString());
        else cell.setBlank();
    }
}