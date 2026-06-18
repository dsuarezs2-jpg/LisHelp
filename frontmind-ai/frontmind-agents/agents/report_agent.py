class ReportAgent:

    def run(self, evaluation_result):

        evaluation = evaluation_result["evaluation"]

        global_score = evaluation["global_score"]
        quality_level = evaluation["quality_level"]

        findings = evaluation["findings"]

        critical = len(
            [f for f in findings if f["severity"] == "Alta"]
        )

        medium = len(
            [f for f in findings if f["severity"] == "Media"]
        )

        low = len(
            [f for f in findings if f["severity"] == "Baja"]
        )

        recommendations = []

        for finding in findings:
            recommendations.append(
                finding["recommendation"]
            )

        recommendations = list(set(recommendations))

        report = {
            "global_score": global_score,
            "quality_level": quality_level,
            "total_findings": len(findings),
            "critical_findings": critical,
            "medium_findings": medium,
            "low_findings": low,
            "scores": evaluation["scores"],
            "recommendations": recommendations,
            "findings": findings
        }

        return {
            "agent": "ReportAgent",
            "status": "completed",
            "report": report
        }