package com.exam.system.util;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class PdfGenerator {

    public static byte[] generateResultPdf(String studentName, String examTitle,
                                            int score, int totalMarks,
                                            double percentage, LocalDateTime date) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(0, 51, 102));
            Paragraph title = new Paragraph("Examination Result Certificate", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Divider
            Font lineFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, BaseColor.GRAY);
            Paragraph line = new Paragraph("________________________________________", lineFont);
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(20);
            document.add(line);

            // Certificate Text
            Font bodyFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
            Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(0, 51, 102));

            Paragraph certText = new Paragraph();
            certText.add(new Chunk("This is to certify that ", bodyFont));
            certText.add(new Chunk(studentName, boldFont));
            certText.add(new Chunk(" has completed the examination.", bodyFont));
            certText.setAlignment(Element.ALIGN_CENTER);
            certText.setSpacingAfter(30);
            document.add(certText);

            // Student Details Table
            Paragraph detailsHeader = new Paragraph("Student Details", headerFont);
            detailsHeader.setSpacingAfter(10);
            document.add(detailsHeader);

            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(20);

            addTableRow(detailsTable, "Student Name", studentName, boldFont, bodyFont);
            addTableRow(detailsTable, "Exam Title", examTitle, boldFont, bodyFont);
            addTableRow(detailsTable, "Date", date != null ? date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")) : "N/A", boldFont, bodyFont);

            document.add(detailsTable);

            // Score Summary Table
            Paragraph scoreHeader = new Paragraph("Score Summary", headerFont);
            scoreHeader.setSpacingAfter(10);
            document.add(scoreHeader);

            PdfPTable scoreTable = new PdfPTable(2);
            scoreTable.setWidthPercentage(100);
            scoreTable.setSpacingAfter(20);

            addTableRow(scoreTable, "Score Obtained", String.valueOf(score), boldFont, bodyFont);
            addTableRow(scoreTable, "Total Marks", String.valueOf(totalMarks), boldFont, bodyFont);
            addTableRow(scoreTable, "Percentage", String.format("%.2f%%", percentage), boldFont, bodyFont);
            addTableRow(scoreTable, "Result", percentage >= 40 ? "PASS" : "FAIL", boldFont,
                    new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, percentage >= 40 ? new BaseColor(0, 128, 0) : BaseColor.RED));

            document.add(scoreTable);

            // Footer
            Paragraph footer = new Paragraph();
            footer.setSpacingBefore(40);
            footer.add(new Chunk("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")),
                    new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.GRAY)));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph disclaimer = new Paragraph("This is a computer-generated certificate and does not require a signature.",
                    new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.GRAY));
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            disclaimer.setSpacingBefore(10);
            document.add(disclaimer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private static void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorderColor(BaseColor.LIGHT_GRAY);
        labelCell.setPadding(8);
        labelCell.setBackgroundColor(new BaseColor(240, 240, 240));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorderColor(BaseColor.LIGHT_GRAY);
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
}
